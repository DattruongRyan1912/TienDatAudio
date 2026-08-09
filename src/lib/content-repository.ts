import fallbackPosts from '../../data/posts.json'
import { getDb, hasMongoConfig } from './mongodb'
import type {
  ContentMutationResult,
  ContentPost,
  PaginatedPosts,
  PostListFilters,
  PostRevision,
} from './content-types'
import { hasPublicStatus, normalizeContentPost, validateContentPost } from './content-validation'

const fallbackContent = (fallbackPosts as unknown[]).map(normalizeContentPost)
let indexesPromise: Promise<unknown> | null = null

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function assertMongo() {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
}

async function ensureContentIndexes() {
  assertMongo()
  if (!indexesPromise) {
    indexesPromise = getDb().then((db) => Promise.all([
      db.collection('posts').createIndex({ slug: 1 }, { unique: true, name: 'posts_slug_unique' }),
      db.collection('posts').createIndex({ status: 1, publishedAt: -1 }, { name: 'posts_status_published' }),
      db.collection('posts').createIndex({ keywordIds: 1 }, { name: 'posts_keyword_ids' }),
      db.collection('post_revisions').createIndex({ postId: 1, version: -1 }, { name: 'post_revisions_post_version' }),
    ])).catch((error) => {
      indexesPromise = null
      throw error
    })
  }
  return indexesPromise
}

function filterFallback(filters: PostListFilters, publicOnly: boolean) {
  const search = filters.search?.trim().toLocaleLowerCase('vi')
  return fallbackContent.filter((post) => {
    if (publicOnly && !hasPublicStatus(post)) return false
    if (!publicOnly && filters.status && filters.status !== 'all' && post.status !== filters.status) return false
    if (filters.keywordId && !post.keywordIds.includes(filters.keywordId)) return false
    if (filters.category && post.category !== filters.category) return false
    if (search && ![post.title, post.excerpt, post.slug, post.category, ...post.tags].join(' ').toLocaleLowerCase('vi').includes(search)) return false
    return true
  }).sort((a, b) => String(b.publishedAt || b.updatedAt).localeCompare(String(a.publishedAt || a.updatedAt)))
}

export async function listContentPosts(filters: PostListFilters = {}, publicOnly = false): Promise<PaginatedPosts> {
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20))
  const page = Math.max(1, Number(filters.page) || 1)

  if (!hasMongoConfig()) {
    const filtered = filterFallback(filters, publicOnly)
    return { items: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, limit }
  }

  try {
    const db = await getDb()
    const query: Record<string, unknown> = {}
    const conditions: Record<string, unknown>[] = []
    if (publicOnly) {
      const now = new Date().toISOString()
      conditions.push({ $or: [
        { status: 'published', publishedAt: { $lte: now } },
        { status: 'scheduled', scheduledAt: { $lte: now } },
        { status: { $exists: false }, published: true, publishedAt: { $lte: now } },
      ] })
    } else if (filters.status && filters.status !== 'all') {
      query.status = filters.status
    }
    if (filters.keywordId) query.keywordIds = filters.keywordId
    if (filters.category) query.category = filters.category
    if (filters.search?.trim()) {
      const pattern = { $regex: escapeRegex(filters.search.trim()), $options: 'i' }
      conditions.push({ $or: [{ title: pattern }, { excerpt: pattern }, { slug: pattern }, { tags: pattern }] })
    }
    if (conditions.length) query.$and = conditions

    const [documents, total] = await Promise.all([
      db.collection('posts').find(query).sort({ publishedAt: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection('posts').countDocuments(query),
    ])
    return { items: documents.map(normalizeContentPost), total, page, limit }
  } catch (error) {
    console.error('[content] MongoDB unavailable, using JSON fallback:', error)
    const filtered = filterFallback(filters, publicOnly)
    return { items: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, limit }
  }
}

export async function getPublicPosts(limit = 100) {
  return (await listContentPosts({ limit }, true)).items
}

export async function getContentPostBySlug(slug: string, publicOnly = false) {
  if (!hasMongoConfig()) {
    const post = fallbackContent.find((item) => item.slug === slug) || null
    return post && (!publicOnly || hasPublicStatus(post)) ? post : null
  }
  try {
    const db = await getDb()
    const document = await db.collection('posts').findOne({ slug })
    if (!document) return null
    const post = normalizeContentPost(document)
    return !publicOnly || hasPublicStatus(post) ? post : null
  } catch (error) {
    console.error('[content] MongoDB unavailable, using JSON fallback:', error)
    const post = fallbackContent.find((item) => item.slug === slug) || null
    return post && (!publicOnly || hasPublicStatus(post)) ? post : null
  }
}

export async function getContentPostById(id: string) {
  if (!hasMongoConfig()) return fallbackContent.find((item) => item.id === id) || null
  const db = await getDb()
  const document = await db.collection('posts').findOne({ id })
  return document ? normalizeContentPost(document) : null
}

function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && Number((error as { code?: number }).code) === 11000)
}

export async function createContentPost(value: unknown): Promise<ContentMutationResult> {
  assertMongo()
  await ensureContentIndexes()
  const now = new Date().toISOString()
  const { post, errors } = validateContentPost({
    ...(value && typeof value === 'object' ? value : {}),
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    version: 1,
  })
  if (errors.length) throw new Error(`VALIDATION:${errors.join('|')}`)
  if (post.status === 'published' && !post.publishedAt) post.publishedAt = now
  const db = await getDb()
  try {
    await db.collection('posts').insertOne(post)
    return { ok: true, post }
  } catch (error) {
    if (isDuplicateKey(error)) return { ok: false, code: 'SLUG_CONFLICT' }
    throw error
  }
}

async function insertRevision(post: ContentPost, reason: PostRevision['reason'], actor: string) {
  const db = await getDb()
  const revision: PostRevision = {
    id: crypto.randomUUID(),
    postId: post.id,
    version: post.version,
    snapshot: post,
    reason,
    actor,
    createdAt: new Date().toISOString(),
  }
  await db.collection('post_revisions').insertOne(revision)
}

type UpdateOptions = { actor?: string; revisionReason?: PostRevision['reason'] }

export async function updateContentPost(
  id: string,
  value: unknown,
  expectedVersion: number,
  options: UpdateOptions = {},
): Promise<ContentMutationResult> {
  assertMongo()
  await ensureContentIndexes()
  const db = await getDb()
  const document = await db.collection('posts').findOne({ id })
  if (!document) return { ok: false, code: 'NOT_FOUND' }
  const current = normalizeContentPost(document)
  if (current.version !== expectedVersion) return { ok: false, code: 'VERSION_CONFLICT', current }

  const now = new Date().toISOString()
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const { post: normalized, errors } = validateContentPost({
    ...current,
    ...input,
    id,
    createdAt: current.createdAt,
    updatedAt: now,
    version: current.version + 1,
  })
  if (normalized.status === 'published' && !normalized.publishedAt) normalized.publishedAt = now
  if (normalized.status === 'archived' && !normalized.archivedAt) normalized.archivedAt = now
  if (normalized.status !== 'archived') normalized.archivedAt = null
  if (errors.length) throw new Error(`VALIDATION:${errors.join('|')}`)

  const versionFilter = expectedVersion === 1
    ? { id, $or: [{ version: expectedVersion }, { version: { $exists: false } }] }
    : { id, version: expectedVersion }
  try {
    const result = await db.collection('posts').replaceOne(versionFilter, normalized)
    if (!result.modifiedCount) {
      const latest = await getContentPostById(id)
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

export async function archiveContentPost(id: string, expectedVersion: number, actor = 'admin') {
  return updateContentPost(id, { status: 'archived' }, expectedVersion, { actor })
}

export async function publishContentPost(id: string, expectedVersion: number, actor = 'admin') {
  const current = await getContentPostById(id)
  if (!current) return { ok: false, code: 'NOT_FOUND' } as ContentMutationResult
  return updateContentPost(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
    scheduledAt: null,
  }, expectedVersion, { actor, revisionReason: 'published' })
}

export async function listPostRevisions(postId: string) {
  assertMongo()
  const db = await getDb()
  const documents = await db.collection('post_revisions').find({ postId }).sort({ version: -1, createdAt: -1 }).limit(100).toArray()
  return documents.map((document) => {
    const { _id: _ignored, ...revision } = document
    void _ignored
    return { ...revision, snapshot: normalizeContentPost(revision.snapshot) } as unknown as PostRevision
  })
}

export async function restorePostRevision(postId: string, revisionId: string, expectedVersion: number, actor = 'admin') {
  assertMongo()
  const db = await getDb()
  const revision = await db.collection('post_revisions').findOne({ id: revisionId, postId })
  if (!revision?.snapshot) return { ok: false, code: 'NOT_FOUND' } as ContentMutationResult
  const snapshot = normalizeContentPost(revision.snapshot)
  return updateContentPost(postId, snapshot, expectedVersion, { actor, revisionReason: 'manual_restore' })
}
