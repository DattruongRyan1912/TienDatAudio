import { createHash, randomUUID } from 'node:crypto'
import type { Document } from 'mongodb'
import { getDb, hasMongoConfig } from '@/lib/mongodb'
import type { ContentPost } from '@/lib/content-types'
import { chunkMarkdown, normalizeKnowledgeText } from '../domain/chunking'
import {
  type ArticleChunk,
  type CompatibilityAssessment,
  type EvidenceReviewStatus,
  type GraphSyncOutboxItem,
  type KnowledgeClaim,
  type KnowledgeEntry,
  type KnowledgeEntryRevision,
  type KnowledgeListFilters,
  type KnowledgeMutationResult,
  type KnowledgeResourceMap,
  type KnowledgeResourceName,
  type KnowledgeSource,
  type PaginatedKnowledge,
} from '../domain/types'
import {
  normalizeCompatibility,
  normalizeKnowledgeClaim,
  normalizeKnowledgeEntry,
  normalizeKnowledgeSource,
  validateCompatibility,
  validateKnowledgeClaim,
  validateKnowledgeEntry,
  validateKnowledgeSource,
} from '../domain/validation'

const collectionNames: Record<KnowledgeResourceName, string> = {
  knowledge: 'assistant_knowledge_entries',
  sources: 'knowledge_sources',
  claims: 'knowledge_claims',
  compatibility: 'compatibility_assessments',
}

let indexesPromise: Promise<unknown> | null = null

function assertMongo() {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && Number((error as { code?: number }).code) === 11000)
}

function withoutMongoId(value: Document) {
  const { _id: _ignored, ...rest } = value
  void _ignored
  return rest
}

export async function ensureKnowledgeIndexes() {
  assertMongo()
  if (!indexesPromise) {
    indexesPromise = getDb().then((db) => Promise.all([
      db.collection('assistant_knowledge_entries').createIndex({ slug: 1 }, { unique: true, name: 'assistant_knowledge_slug_unique' }),
      db.collection('assistant_knowledge_entries').createIndex({ reviewStatus: 1, type: 1, priority: -1 }, { name: 'assistant_knowledge_status_type_priority' }),
      db.collection('assistant_knowledge_entries').createIndex({ aliases: 1 }, { name: 'assistant_knowledge_aliases' }),
      db.collection('assistant_knowledge_revisions').createIndex({ entryId: 1, version: -1 }, { unique: true, name: 'assistant_knowledge_revision_unique' }),
      db.collection('knowledge_sources').createIndex({ reviewStatus: 1, type: 1, updatedAt: -1 }, { name: 'knowledge_sources_status_type' }),
      db.collection('knowledge_claims').createIndex({ reviewStatus: 1, 'subject.sourceId': 1, predicate: 1 }, { name: 'knowledge_claims_subject' }),
      db.collection('knowledge_claims').createIndex({ sourceIds: 1 }, { name: 'knowledge_claims_sources' }),
      db.collection('compatibility_assessments').createIndex({ reviewStatus: 1, componentIds: 1, useCases: 1 }, { name: 'compatibility_verified_components' }),
      db.collection('article_chunks').createIndex({ articleId: 1, articleVersion: 1, chunkIndex: 1 }, { unique: true, name: 'article_chunks_version_unique' }),
      db.collection('article_chunks').createIndex({ articleSlug: 1, articleVersion: -1 }, { name: 'article_chunks_slug_version' }),
      db.collection('graph_sync_outbox').createIndex({ aggregateType: 1, aggregateId: 1 }, { unique: true, name: 'graph_sync_aggregate_unique' }),
      db.collection('graph_sync_outbox').createIndex({ status: 1, availableAt: 1 }, { name: 'graph_sync_pending' }),
      db.collection('graph_sync_state').createIndex({ key: 1 }, { unique: true, name: 'graph_sync_state_key_unique' }),
    ])).catch((error) => {
      indexesPromise = null
      throw error
    })
  }
  return indexesPromise
}

function normalizeResource<R extends KnowledgeResourceName>(resource: R, value: unknown): KnowledgeResourceMap[R] {
  if (resource === 'knowledge') return normalizeKnowledgeEntry(value) as KnowledgeResourceMap[R]
  if (resource === 'sources') return normalizeKnowledgeSource(value) as KnowledgeResourceMap[R]
  if (resource === 'claims') return normalizeKnowledgeClaim(value) as KnowledgeResourceMap[R]
  return normalizeCompatibility(value) as KnowledgeResourceMap[R]
}

function validateResource<R extends KnowledgeResourceName>(resource: R, value: unknown, fallback: Partial<KnowledgeResourceMap[R]> = {}) {
  if (resource === 'knowledge') {
    const result = validateKnowledgeEntry(value, fallback as Partial<KnowledgeEntry>)
    return { value: result.entry as KnowledgeResourceMap[R], errors: result.errors }
  }
  if (resource === 'sources') {
    const result = validateKnowledgeSource(value, fallback as Partial<KnowledgeSource>)
    return { value: result.source as KnowledgeResourceMap[R], errors: result.errors }
  }
  if (resource === 'claims') {
    const result = validateKnowledgeClaim(value, fallback as Partial<KnowledgeClaim>)
    return { value: result.claim as KnowledgeResourceMap[R], errors: result.errors }
  }
  const result = validateCompatibility(value, fallback as Partial<CompatibilityAssessment>)
  return { value: result.assessment as KnowledgeResourceMap[R], errors: result.errors }
}

function searchFields(resource: KnowledgeResourceName) {
  if (resource === 'knowledge') return ['title', 'slug', 'answerMarkdown', 'aliases', 'tags']
  if (resource === 'sources') return ['title', 'organization', 'url']
  if (resource === 'claims') return ['subject.label', 'predicate', 'object.label', 'reason']
  return ['componentIds', 'useCases', 'preferences', 'reason']
}

export async function listKnowledgeResources<R extends KnowledgeResourceName>(resource: R, filters: KnowledgeListFilters = {}): Promise<PaginatedKnowledge<KnowledgeResourceMap[R]>> {
  assertMongo()
  await ensureKnowledgeIndexes()
  const page = Math.max(1, Number(filters.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20))
  const query: Record<string, unknown> = {}
  if (filters.status) query[resource === 'knowledge' ? 'reviewStatus' : 'reviewStatus'] = filters.status
  if (filters.type && (resource === 'knowledge' || resource === 'sources')) query.type = filters.type
  if (filters.search?.trim()) {
    const pattern = { $regex: escapeRegex(filters.search.trim()), $options: 'i' }
    query.$or = searchFields(resource).map((field) => ({ [field]: pattern }))
  }
  const collection = (await getDb()).collection(collectionNames[resource])
  const [documents, total] = await Promise.all([
    collection.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(query),
  ])
  return { items: documents.map((document) => normalizeResource(resource, document)), total, page, limit }
}

export async function getKnowledgeResource<R extends KnowledgeResourceName>(resource: R, id: string): Promise<KnowledgeResourceMap[R] | null> {
  assertMongo()
  const document = await (await getDb()).collection(collectionNames[resource]).findOne({ id })
  return document ? normalizeResource(resource, document) : null
}

async function insertKnowledgeRevision(entry: KnowledgeEntry, action: KnowledgeEntryRevision['action'], actor: string) {
  const revision: KnowledgeEntryRevision = {
    id: randomUUID(),
    entryId: entry.id,
    version: entry.version,
    snapshot: entry,
    action,
    actor,
    createdAt: new Date().toISOString(),
  }
  await (await getDb()).collection('assistant_knowledge_revisions').updateOne(
    { entryId: entry.id, version: entry.version },
    { $setOnInsert: revision },
    { upsert: true },
  )
}

export async function queueGraphSync(input: Omit<GraphSyncOutboxItem, 'id' | 'status' | 'attempts' | 'availableAt' | 'lastError' | 'createdAt' | 'updatedAt'>) {
  if (!hasMongoConfig()) return
  const now = new Date().toISOString()
  await (await getDb()).collection('graph_sync_outbox').updateOne(
    { aggregateType: input.aggregateType, aggregateId: input.aggregateId },
    {
      $set: {
        ...input,
        status: 'pending',
        attempts: 0,
        availableAt: now,
        lastError: '',
        updatedAt: now,
      },
      $setOnInsert: { id: randomUUID(), createdAt: now },
    },
    { upsert: true },
  )
}

function aggregateType(resource: KnowledgeResourceName): GraphSyncOutboxItem['aggregateType'] {
  if (resource === 'knowledge') return 'knowledge'
  if (resource === 'sources') return 'source'
  if (resource === 'claims') return 'claim'
  return 'compatibility'
}

async function assertEvidenceReferences<R extends KnowledgeResourceName>(resource: R, value: KnowledgeResourceMap[R]) {
  const shouldVerify = (resource === 'knowledge' && value.reviewStatus === 'published')
    || (resource !== 'knowledge' && resource !== 'sources' && value.reviewStatus === 'verified')
  if (!shouldVerify) return

  const sourceIds = 'sourceIds' in value ? Array.from(new Set(value.sourceIds)) : []
  const db = await getDb()
  const verifiedSources = await db.collection('knowledge_sources').countDocuments({ id: { $in: sourceIds }, reviewStatus: 'verified' })
  if (verifiedSources !== sourceIds.length) throw new Error('VALIDATION:Tất cả nguồn tham chiếu phải tồn tại và ở trạng thái verified')

  if (resource === 'compatibility') {
    const assessment = value as CompatibilityAssessment
    const productCount = await db.collection('products').countDocuments({ id: { $in: assessment.componentIds } })
    if (productCount !== new Set(assessment.componentIds).size) throw new Error('VALIDATION:Tất cả sản phẩm phối ghép phải tồn tại trong catalog')
  }
}

export async function createKnowledgeResource<R extends KnowledgeResourceName>(resource: R, value: unknown, _actor: string): Promise<KnowledgeMutationResult<KnowledgeResourceMap[R]>> {
  assertMongo()
  await ensureKnowledgeIndexes()
  const now = new Date().toISOString()
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const initialStatus = resource === 'knowledge' ? 'draft' : resource === 'sources' ? 'review' : 'suggested'
  const validated = validateResource(resource, {
    ...input,
    reviewStatus: initialStatus,
    reviewedBy: null,
    reviewedAt: null,
    verifiedBy: null,
    verifiedAt: null,
    id: randomUUID(),
    version: 1,
    createdAt: now,
    updatedAt: now,
  })
  if (validated.errors.length) throw new Error(`VALIDATION:${validated.errors.join('|')}`)
  await assertEvidenceReferences(resource, validated.value)
  try {
    await (await getDb()).collection(collectionNames[resource]).insertOne(validated.value as unknown as Document)
    await queueGraphSync({ aggregateType: aggregateType(resource), aggregateId: validated.value.id, aggregateVersion: validated.value.version, operation: 'upsert' })
    return { ok: true, value: validated.value }
  } catch (error) {
    if (isDuplicateKey(error)) return { ok: false, code: 'SLUG_CONFLICT' }
    throw error
  }
}

type UpdateKnowledgeOptions = { action?: KnowledgeEntryRevision['action']; forceStatus?: string; clearReview?: boolean }

export async function updateKnowledgeResource<R extends KnowledgeResourceName>(
  resource: R,
  id: string,
  value: unknown,
  expectedVersion: number,
  actor: string,
  options: UpdateKnowledgeOptions = {},
): Promise<KnowledgeMutationResult<KnowledgeResourceMap[R]>> {
  assertMongo()
  await ensureKnowledgeIndexes()
  const current = await getKnowledgeResource(resource, id)
  if (!current) return { ok: false, code: 'NOT_FOUND' }
  if (current.version !== expectedVersion) return { ok: false, code: 'VERSION_CONFLICT', current }

  const now = new Date().toISOString()
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const safeInput = { ...input }
  for (const field of ['reviewStatus', 'reviewedBy', 'reviewedAt', 'verifiedBy', 'verifiedAt']) delete safeInput[field]
  const requestedStatus = options.forceStatus || current.reviewStatus
  const reviewerFields = options.clearReview
    ? { reviewedBy: null, reviewedAt: null, verifiedBy: null, verifiedAt: null }
    : requestedStatus === 'published'
    ? { reviewedBy: actor, reviewedAt: now }
    : requestedStatus === 'verified'
      ? { verifiedBy: actor, verifiedAt: now, reviewedBy: actor, reviewedAt: now }
      : {}
  const validated = validateResource(resource, {
    ...current,
    ...safeInput,
    reviewStatus: requestedStatus,
    ...reviewerFields,
    id,
    version: expectedVersion + 1,
    createdAt: current.createdAt,
    updatedAt: now,
  }, current)
  if (validated.errors.length) throw new Error(`VALIDATION:${validated.errors.join('|')}`)
  await assertEvidenceReferences(resource, validated.value)

  try {
    const result = await (await getDb()).collection(collectionNames[resource]).replaceOne({ id, version: expectedVersion }, validated.value as unknown as Document)
    if (!result.modifiedCount) {
      const latest = await getKnowledgeResource(resource, id)
      return latest ? { ok: false, code: 'VERSION_CONFLICT', current: latest } : { ok: false, code: 'NOT_FOUND' }
    }
    if (resource === 'knowledge') await insertKnowledgeRevision(current as KnowledgeEntry, options.action || 'updated', actor)
    await queueGraphSync({ aggregateType: aggregateType(resource), aggregateId: id, aggregateVersion: validated.value.version, operation: 'upsert' })
    return { ok: true, value: validated.value }
  } catch (error) {
    if (isDuplicateKey(error)) return { ok: false, code: 'SLUG_CONFLICT' }
    throw error
  }
}

export async function archiveKnowledgeResource<R extends KnowledgeResourceName>(resource: R, id: string, expectedVersion: number, actor: string) {
  return updateKnowledgeResource(resource, id, {}, expectedVersion, actor, { forceStatus: 'archived', action: 'archived' })
}

export async function submitKnowledgeForReview(id: string, expectedVersion: number, actor: string) {
  return updateKnowledgeResource('knowledge', id, {}, expectedVersion, actor, { forceStatus: 'review', action: 'reviewed' })
}

export async function publishKnowledgeEntry(id: string, expectedVersion: number, actor: string) {
  return updateKnowledgeResource('knowledge', id, {}, expectedVersion, actor, { forceStatus: 'published', action: 'published' })
}

export async function listKnowledgeRevisions(entryId: string) {
  assertMongo()
  const documents = await (await getDb()).collection('assistant_knowledge_revisions').find({ entryId }).sort({ version: -1, createdAt: -1 }).limit(100).toArray()
  return documents.map((document) => {
    const revision = withoutMongoId(document)
    return { ...revision, snapshot: normalizeKnowledgeEntry(revision.snapshot) } as unknown as KnowledgeEntryRevision
  })
}

export async function restoreKnowledgeRevision(entryId: string, revisionId: string, expectedVersion: number, actor: string) {
  assertMongo()
  const revision = await (await getDb()).collection('assistant_knowledge_revisions').findOne({ id: revisionId, entryId })
  if (!revision?.snapshot) return { ok: false, code: 'NOT_FOUND' } as KnowledgeMutationResult<KnowledgeEntry>
  const snapshot = normalizeKnowledgeEntry(revision.snapshot)
  return updateKnowledgeResource('knowledge', entryId, {
    ...snapshot,
  }, expectedVersion, actor, { action: 'restored', forceStatus: 'draft', clearReview: true })
}

export async function listPublishedKnowledgeEntries() {
  if (!hasMongoConfig()) return [] as KnowledgeEntry[]
  const now = new Date().toISOString()
  const documents = await (await getDb()).collection('assistant_knowledge_entries').find({
    reviewStatus: 'published',
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $exists: false } }, { validFrom: { $lte: now } }] },
      { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
    ],
  }).sort({ priority: -1, updatedAt: -1 }).limit(1000).toArray()
  return documents.map((document) => normalizeKnowledgeEntry(document))
}

export async function listVerifiedClaims() {
  if (!hasMongoConfig()) return [] as KnowledgeClaim[]
  const now = new Date().toISOString()
  const documents = await (await getDb()).collection('knowledge_claims').find({
    reviewStatus: 'verified',
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $exists: false } }, { validFrom: { $lte: now } }] },
      { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
    ],
  }).limit(1000).toArray()
  return documents.map((document) => normalizeKnowledgeClaim(document))
}

export async function listVerifiedCompatibility() {
  if (!hasMongoConfig()) return [] as CompatibilityAssessment[]
  const documents = await (await getDb()).collection('compatibility_assessments').find({ reviewStatus: 'verified' }).limit(1000).toArray()
  return documents.map((document) => normalizeCompatibility(document))
}

export async function rebuildArticleChunks(post: ContentPost) {
  assertMongo()
  await ensureKnowledgeIndexes()
  const now = new Date().toISOString()
  const drafts = chunkMarkdown(post.bodyMarkdown)
  const chunks: ArticleChunk[] = drafts.map((draft) => {
    const source = `${post.id}:${post.version}:${draft.chunkIndex}:${draft.headingPath.join('/')}:${draft.text}`
    const contentHash = createHash('sha256').update(source).digest('hex')
    return {
      id: `${post.id}:${post.version}:${draft.chunkIndex}`,
      articleId: post.id,
      articleSlug: post.slug,
      articleTitle: post.title,
      articleVersion: post.version,
      chunkIndex: draft.chunkIndex,
      headingPath: draft.headingPath,
      text: draft.text,
      normalizedText: draft.normalizedText,
      tokenCount: draft.tokenCount,
      entityRefs: [],
      sourceUpdatedAt: post.updatedAt,
      contentHash,
      createdAt: now,
      updatedAt: now,
    }
  })
  const db = await getDb()
  if (chunks.length) {
    await db.collection('article_chunks').bulkWrite(chunks.map((chunk) => ({
      updateOne: {
        filter: { articleId: chunk.articleId, articleVersion: chunk.articleVersion, chunkIndex: chunk.chunkIndex },
        update: { $set: chunk },
        upsert: true,
      },
    })), { ordered: false })
  }
  await db.collection('article_chunks').deleteMany({ articleId: post.id, articleVersion: { $ne: post.version } })
  await db.collection('article_chunks').deleteMany({ articleId: post.id, articleVersion: post.version, chunkIndex: { $gte: chunks.length } })
  await queueGraphSync({ aggregateType: 'article', aggregateId: post.id, aggregateVersion: post.version, operation: post.status === 'archived' ? 'delete' : 'upsert' })
  return chunks
}

export async function searchArticleChunks(query: string, limit = 20) {
  if (!hasMongoConfig()) return [] as ArticleChunk[]
  const normalized = normalizeKnowledgeText(query)
  const terms = normalized.split(' ').filter((term) => term.length > 1).slice(0, 12)
  if (!terms.length) return [] as ArticleChunk[]
  const pattern = { $regex: terms.map(escapeRegex).join('|'), $options: 'i' }
  const documents = await (await getDb()).collection('article_chunks').find({
    $or: [{ normalizedText: pattern }, { articleTitle: pattern }, { headingPath: pattern }],
  }).sort({ sourceUpdatedAt: -1 }).limit(Math.min(300, Math.max(limit * 12, 60))).toArray()
  const queryTerms = new Set(terms)
  return documents
    .map((document) => {
      const chunk = withoutMongoId(document) as unknown as ArticleChunk
      const chunkTerms = new Set(chunk.normalizedText.split(' '))
      const score = Array.from(queryTerms).reduce((total, term) => total + (chunkTerms.has(term) ? 1 : 0), 0)
      const headingScore = Array.from(queryTerms).reduce((total, term) => total + (normalizeKnowledgeText(chunk.headingPath.join(' ')).split(' ').includes(term) ? 3 : 0), 0)
      return { chunk, score: score + headingScore }
    })
    .filter((item) => item.score >= Math.min(2, terms.length))
    .sort((a, b) => b.score - a.score || b.chunk.sourceUpdatedAt.localeCompare(a.chunk.sourceUpdatedAt))
    .slice(0, Math.max(1, limit))
    .map((item) => item.chunk)
}

export async function updateEvidenceReviewStatus<R extends Exclude<KnowledgeResourceName, 'knowledge'>>(
  resource: R,
  id: string,
  reviewStatus: EvidenceReviewStatus,
  expectedVersion: number,
  actor: string,
) {
  return updateKnowledgeResource(resource, id, {}, expectedVersion, actor, { forceStatus: reviewStatus })
}

export async function knowledgeOperationsOverview() {
  if (!hasMongoConfig()) return { knowledge: 0, sources: 0, claims: 0, compatibility: 0, articleChunks: 0, pendingGraphSync: 0 }
  const db = await getDb()
  const [knowledge, sources, claims, compatibility, articleChunks, pendingGraphSync] = await Promise.all([
    db.collection(collectionNames.knowledge).countDocuments(),
    db.collection(collectionNames.sources).countDocuments(),
    db.collection(collectionNames.claims).countDocuments(),
    db.collection(collectionNames.compatibility).countDocuments(),
    db.collection('article_chunks').countDocuments(),
    db.collection('graph_sync_outbox').countDocuments({ status: { $in: ['pending', 'failed'] } }),
  ])
  return { knowledge, sources, claims, compatibility, articleChunks, pendingGraphSync }
}
