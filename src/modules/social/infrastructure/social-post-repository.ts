import { getDb, hasMongoConfig } from '@/lib/mongodb'
import { hasPublicSocialStatus, normalizeSocialPost, validateSocialPost } from '../domain/validation'
import { isSocialHubEnabled } from '../domain/feature-flag'
import type { PaginatedSocialPosts, SocialMutationResult, SocialPost, SocialPostListFilters, SocialPostRevision } from '../domain/types'

let indexesPromise: Promise<unknown> | null = null

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function assertMongo() {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
}

async function ensureSocialIndexes() {
  assertMongo()
  if (!indexesPromise) {
    indexesPromise = getDb().then((db) => Promise.all([
      db.collection('posts').createIndex({ slug: 1 }, { unique: true, name: 'posts_slug_unique' }),
      db.collection('posts').createIndex({ contentType: 1, status: 1, publishedAt: -1 }, { name: 'posts_social_status_published' }),
      db.collection('posts').createIndex({ contentType: 1, category: 1, publishedAt: -1 }, { name: 'posts_social_category_published' }),
      db.collection('posts').createIndex({ relatedProductIds: 1 }, { name: 'posts_related_product_ids' }),
      db.collection('posts').createIndex({ contentType: 1, tags: 1 }, { name: 'posts_social_tags' }),
      db.collection('posts').createIndex({ contentType: 1, legacySlugs: 1 }, { name: 'posts_social_legacy_slugs' }),
    ])).catch((error) => {
      indexesPromise = null
      throw error
    })
  }
  return indexesPromise
}

function fallbackList(filters: SocialPostListFilters): PaginatedSocialPosts {
  const limit = Math.min(30, Math.max(1, Number(filters.limit) || 12))
  const page = Math.max(1, Number(filters.page) || 1)
  return { items: [], total: 0, page, limit }
}

function publicQuery(now: string) {
  return {
    contentType: 'social',
    $or: [
      { status: 'published', publishedAt: { $lte: now } },
      { status: 'scheduled', scheduledAt: { $lte: now } },
    ],
  }
}

export async function listSocialPosts(filters: SocialPostListFilters = {}, publicOnly = true): Promise<PaginatedSocialPosts> {
  const limit = Math.min(30, Math.max(1, Number(filters.limit) || 12))
  const page = Math.max(1, Number(filters.page) || 1)
  if (publicOnly && !isSocialHubEnabled()) return fallbackList({ ...filters, limit, page })
  if (!hasMongoConfig()) return fallbackList({ ...filters, limit, page })

  try {
    await ensureSocialIndexes()
    const db = await getDb()
    const conditions: Record<string, unknown>[] = [
      publicOnly ? publicQuery(new Date().toISOString()) : { contentType: 'social' },
    ]
    if (!publicOnly && filters.status && filters.status !== 'all') conditions.push({ status: filters.status })
    if (filters.category) conditions.push({ category: filters.category })
    if (filters.search?.trim()) {
      const pattern = { $regex: escapeRegex(filters.search.trim()), $options: 'i' }
      conditions.push({ $or: [{ title: pattern }, { text: pattern }, { excerpt: pattern }, { slug: pattern }, { tags: pattern }] })
    }
    const query = conditions.length === 1 ? conditions[0] : { $and: conditions }
    const [documents, total] = await Promise.all([
      db.collection('posts').find(query).sort({ publishedAt: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection('posts').countDocuments(query),
    ])
    return { items: documents.map(normalizeSocialPost), total, page, limit }
  } catch (error) {
    console.error('[social-posts] MongoDB unavailable:', error)
    return fallbackList({ ...filters, limit, page })
  }
}

export async function getAllPublicSocialPosts() {
  if (!isSocialHubEnabled() || !hasMongoConfig()) return [] as SocialPost[]
  try {
    await ensureSocialIndexes()
    const documents = await (await getDb()).collection('posts').find(publicQuery(new Date().toISOString())).sort({ publishedAt: -1, updatedAt: -1 }).limit(1000).toArray()
    return documents.map(normalizeSocialPost)
  } catch (error) {
    console.error('[social-posts] MongoDB unavailable:', error)
    return [] as SocialPost[]
  }
}

export async function getSocialPostBySlug(slug: string, publicOnly = true) {
  if (publicOnly && !isSocialHubEnabled()) return null
  if (!hasMongoConfig()) return null
  try {
    const db = await getDb()
    const document = await db.collection('posts').findOne({ contentType: 'social', $or: [{ slug }, { legacySlugs: slug }] })
    if (!document) return null
    const post = normalizeSocialPost(document)
    return !publicOnly || hasPublicSocialStatus(post) ? post : null
  } catch (error) {
    console.error('[social-posts] MongoDB unavailable:', error)
    return null
  }
}

export async function getSocialPostById(id: string) {
  if (!hasMongoConfig()) return null
  const db = await getDb()
  const document = await db.collection('posts').findOne({ contentType: 'social', id })
  return document ? normalizeSocialPost(document) : null
}

function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && Number((error as { code?: number }).code) === 11000)
}

export async function createSocialPost(value: unknown): Promise<SocialMutationResult> {
  assertMongo()
  await ensureSocialIndexes()
  const now = new Date().toISOString()
  const { post, errors } = validateSocialPost({
    ...(value && typeof value === 'object' ? value : {}),
    id: crypto.randomUUID(),
    contentType: 'social',
    createdAt: now,
    updatedAt: now,
    version: 1,
  })
  if (errors.length) throw new Error(`VALIDATION:${errors.join('|')}`)
  if (post.status === 'published' && !post.publishedAt) post.publishedAt = now
  try {
    await (await getDb()).collection('posts').insertOne(post)
    return { ok: true, post }
  } catch (error) {
    if (isDuplicateKey(error)) return { ok: false, code: 'SLUG_CONFLICT' }
    throw error
  }
}

async function insertRevision(post: SocialPost, reason: SocialPostRevision['reason'], actor: string) {
  const revision: SocialPostRevision = {
    id: crypto.randomUUID(),
    postId: post.id,
    version: post.version,
    snapshot: post,
    reason,
    actor,
    createdAt: new Date().toISOString(),
  }
  await (await getDb()).collection('post_revisions').insertOne(revision)
}

type UpdateOptions = { actor?: string; revisionReason?: SocialPostRevision['reason'] }

export async function updateSocialPost(id: string, value: unknown, expectedVersion: number, options: UpdateOptions = {}): Promise<SocialMutationResult> {
  assertMongo()
  await ensureSocialIndexes()
  const db = await getDb()
  const document = await db.collection('posts').findOne({ contentType: 'social', id })
  if (!document) return { ok: false, code: 'NOT_FOUND' }
  const current = normalizeSocialPost(document)
  if (current.version !== expectedVersion) return { ok: false, code: 'VERSION_CONFLICT', current }

  const now = new Date().toISOString()
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const { post: normalized, errors } = validateSocialPost({
    ...current,
    ...input,
    contentType: 'social',
    id,
    createdAt: current.createdAt,
    updatedAt: now,
    version: current.version + 1,
  })
  if (normalized.status === 'published' && !normalized.publishedAt) normalized.publishedAt = now
  if (normalized.status === 'archived' && !normalized.archivedAt) normalized.archivedAt = now
  if (normalized.status !== 'archived') normalized.archivedAt = null
  if (errors.length) throw new Error(`VALIDATION:${errors.join('|')}`)

  const versionFilter = { contentType: 'social', id, version: expectedVersion }
  try {
    const result = await db.collection('posts').replaceOne(versionFilter, normalized)
    if (!result.modifiedCount) {
      const latest = await getSocialPostById(id)
      return latest ? { ok: false, code: 'VERSION_CONFLICT', current: latest } : { ok: false, code: 'NOT_FOUND' }
    }
    const reason = options.revisionReason
      || (normalized.status === 'published' && current.status !== 'published' ? 'published' : null)
      || (current.status === 'published' ? 'published_update' : null)
    if (reason) await insertRevision(current, reason, options.actor || 'admin')
    return { ok: true, post: normalized }
  } catch (error) {
    if (isDuplicateKey(error)) return { ok: false, code: 'SLUG_CONFLICT' }
    throw error
  }
}

export async function publishSocialPost(id: string, expectedVersion: number, actor = 'admin') {
  return updateSocialPost(id, { status: 'published', publishedAt: new Date().toISOString(), scheduledAt: null }, expectedVersion, { actor, revisionReason: 'published' })
}

export async function archiveSocialPost(id: string, expectedVersion: number, actor = 'admin') {
  return updateSocialPost(id, { status: 'archived' }, expectedVersion, { actor })
}

export async function listSocialPostRevisions(postId: string) {
  assertMongo()
  const documents = await (await getDb()).collection('post_revisions').find({ postId }).sort({ version: -1, createdAt: -1 }).limit(100).toArray()
  return documents
    .filter((document) => document.snapshot && (document.snapshot as Record<string, unknown>).contentType === 'social')
    .map((document) => normalizeSocialRevision(document))
}

function normalizeSocialRevision(document: Record<string, unknown>): SocialPostRevision {
  return {
    id: String(document.id || ''),
    postId: String(document.postId || ''),
    version: Number(document.version) || 1,
    snapshot: normalizeSocialPost(document.snapshot),
    reason: document.reason === 'manual_restore' || document.reason === 'published_update' ? document.reason : 'published',
    actor: String(document.actor || 'admin'),
    createdAt: String(document.createdAt || new Date().toISOString()),
  }
}

export async function restoreSocialPostRevision(postId: string, revisionId: string, expectedVersion: number, actor = 'admin') {
  assertMongo()
  const revision = await (await getDb()).collection('post_revisions').findOne({ id: revisionId, postId })
  if (!revision?.snapshot) return { ok: false, code: 'NOT_FOUND' } as SocialMutationResult
  return updateSocialPost(postId, normalizeSocialPost(revision.snapshot), expectedVersion, { actor, revisionReason: 'manual_restore' })
}
