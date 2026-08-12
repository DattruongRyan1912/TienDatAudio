import { createHash } from 'node:crypto'
import { getDb, hasMongoConfig } from '@/lib/mongodb'
import { normalizeCompatibility, normalizeKnowledgeClaim, normalizeKnowledgeSource } from '@/modules/knowledge/domain/validation'
import { normalizeKnowledgeEntry } from '@/modules/knowledge/domain/validation'
import type { GraphProjectionRow, GraphProjectionSnapshot, GraphVerificationReport } from '../domain/types'
import { getNeo4jHealth, runNeo4jProjectionWrite, runNeo4jRead } from './neo4j-http-client'

const projectionName = 'tiendataudio-v1'

function sourceKey(sourceType: string, mongoId: string) {
  return `${sourceType}:${mongoId}`
}

function syncHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function valueId(value: Record<string, unknown>) {
  return String(value.id || value._id || '')
}

function iso(value: unknown) {
  const parsed = value instanceof Date ? value : new Date(String(value || ''))
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

type OntologyEntityType = 'concept' | 'problem' | 'solution' | 'use_case' | 'listening_preference' | 'project'

const ontologyLabels: Record<OntologyEntityType, string> = {
  concept: 'Concept',
  problem: 'Problem',
  solution: 'Solution',
  use_case: 'UseCase',
  listening_preference: 'ListeningPreference',
  project: 'Project',
}

function normalizedEntityType(value: unknown) {
  const type = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (type === 'usecase') return 'use_case'
  if (['preference', 'music_preference', 'listeningpreference'].includes(type)) return 'listening_preference'
  if (type === 'issue') return 'problem'
  if (type === 'fix') return 'solution'
  return type
}

function stableEntityId(type: string, sourceId: unknown, label: unknown) {
  const id = String(sourceId || '').trim()
  if (id) return id
  return createHash('sha256').update(`${type}:${String(label || '').trim().toLowerCase()}`).digest('hex').slice(0, 24)
}

function entitySourceKey(typeValue: unknown, sourceId: unknown, label: unknown) {
  const type = normalizedEntityType(typeValue)
  const id = stableEntityId(type, sourceId, label)
  if (!type || !id) return null
  if (['product', 'brand', 'category', 'article', 'knowledge', 'source'].includes(type)) return sourceKey(type, id)
  return type in ontologyLabels ? sourceKey(type, id) : null
}

function addOntologyEntity(
  maps: Record<OntologyEntityType, Map<string, GraphProjectionRow>>,
  typeValue: unknown,
  sourceIdValue: unknown,
  labelValue: unknown,
  sourceVersionValue: unknown,
  sourceUpdatedAtValue: unknown,
) {
  const type = normalizedEntityType(typeValue) as OntologyEntityType
  if (!(type in ontologyLabels)) return null
  const label = String(labelValue || '').trim().slice(0, 240)
  if (!label) return null
  const mongoId = stableEntityId(type, sourceIdValue, label)
  const key = sourceKey(type, mongoId)
  const row = {
    sourceKey: key,
    mongoId,
    sourceType: type,
    name: label,
    normalizedName: label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
    sourceVersion: Number(sourceVersionValue) || 1,
    sourceUpdatedAt: iso(sourceUpdatedAtValue),
    projection: projectionName,
  }
  maps[type].set(key, { ...row, syncHash: syncHash(row) })
  return key
}

export async function buildGraphProjectionSnapshot(): Promise<GraphProjectionSnapshot> {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
  const db = await getDb()
  const [productDocs, brandDocs, categoryDocs, articleDocs, chunkDocs, sourceDocs, claimDocs, compatibilityDocs, knowledgeDocs] = await Promise.all([
    db.collection('products').find({}).toArray(),
    db.collection('brands').find({}).toArray(),
    db.collection('categories').find({}).toArray(),
    db.collection('posts').find({ $or: [{ contentType: 'editorial' }, { contentType: { $exists: false } }], status: 'published' }).toArray(),
    db.collection('article_chunks').find({}).toArray(),
    db.collection('knowledge_sources').find({ reviewStatus: 'verified' }).toArray(),
    db.collection('knowledge_claims').find({ reviewStatus: 'verified' }).toArray(),
    db.collection('compatibility_assessments').find({ reviewStatus: 'verified' }).toArray(),
    db.collection('assistant_knowledge_entries').find({ reviewStatus: 'published' }).toArray(),
  ])

  const brands = brandDocs.map((document) => {
    const id = valueId(document)
    const row = { sourceKey: sourceKey('brand', id), mongoId: id, sourceType: 'brand', name: String(document.name || ''), slug: String(document.slug || ''), sourceVersion: Number(document.version) || 1, sourceUpdatedAt: iso(document.updatedAt), projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const categories = categoryDocs.map((document) => {
    const id = valueId(document)
    const row = { sourceKey: sourceKey('category', id), mongoId: id, sourceType: 'category', name: String(document.name || ''), slug: String(document.slug || ''), sourceVersion: Number(document.version) || 1, sourceUpdatedAt: iso(document.updatedAt), projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const products = productDocs.map((document) => {
    const id = valueId(document)
    const row = { sourceKey: sourceKey('product', id), mongoId: id, sourceType: 'product', name: String(document.name || ''), slug: String(document.slug || ''), brandId: String(document.brand_id || ''), categoryId: String(document.category_id || ''), sourceVersion: Number(document.version) || 1, sourceUpdatedAt: iso(document.updatedAt), projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const editorialArticles = articleDocs.map((document) => {
    const id = valueId(document)
    const row = { sourceKey: sourceKey('article', id), mongoId: id, sourceType: 'article', title: String(document.title || ''), slug: String(document.slug || ''), sourceVersion: Number(document.version) || 1, sourceUpdatedAt: iso(document.updatedAt), projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const knowledgeArticles = knowledgeDocs.map((document) => {
    const entry = normalizeKnowledgeEntry(document)
    const row = { sourceKey: sourceKey('knowledge', entry.id), mongoId: entry.id, sourceType: 'knowledge', title: entry.title, slug: entry.slug, sourceVersion: entry.version, sourceUpdatedAt: entry.updatedAt, projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const articles = [...editorialArticles, ...knowledgeArticles]
  const chunks = chunkDocs.map((document) => {
    const id = String(document.id || '')
    const row = { sourceKey: sourceKey('chunk', id), mongoId: id, sourceType: 'chunk', articleId: String(document.articleId || ''), heading: Array.isArray(document.headingPath) ? document.headingPath.join(' > ') : '', text: String(document.text || '').slice(0, 4000), sourceVersion: Number(document.articleVersion) || 1, sourceUpdatedAt: iso(document.sourceUpdatedAt), projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const sources = sourceDocs.map((document) => {
    const source = normalizeKnowledgeSource(document)
    const row = { sourceKey: sourceKey('source', source.id), mongoId: source.id, sourceType: 'source', title: source.title, organization: source.organization, url: source.url, sourceVersion: source.version, sourceUpdatedAt: source.updatedAt, projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const normalizedClaims = claimDocs.map((document) => normalizeKnowledgeClaim(document))
  const claims = normalizedClaims.map((claim) => {
    const row = { sourceKey: sourceKey('claim', claim.id), mongoId: claim.id, sourceType: 'claim', subjectId: claim.subject.sourceId, subjectType: claim.subject.type, predicate: claim.predicate, objectId: claim.object.sourceId || '', objectType: claim.object.type, objectLabel: claim.object.label, reason: claim.reason, sourceIds: claim.sourceIds, confidence: claim.confidence, sourceVersion: claim.version, sourceUpdatedAt: claim.updatedAt, projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })
  const normalizedCompatibility = compatibilityDocs.map((document) => normalizeCompatibility(document))
  const compatibility = normalizedCompatibility.map((assessment) => {
    const row = { sourceKey: sourceKey('compatibility', assessment.id), mongoId: assessment.id, sourceType: 'compatibility', componentIds: assessment.componentIds, useCases: assessment.useCases, preferences: assessment.preferences, verdict: assessment.verdict, reason: assessment.reason, sourceIds: assessment.sourceIds, minM2: assessment.room.minM2, maxM2: assessment.room.maxM2, confidence: assessment.confidence, sourceVersion: assessment.version, sourceUpdatedAt: assessment.updatedAt, projection: projectionName }
    return { ...row, syncHash: syncHash(row) }
  })

  const entityMaps: Record<OntologyEntityType, Map<string, GraphProjectionRow>> = {
    concept: new Map(), problem: new Map(), solution: new Map(), use_case: new Map(),
    listening_preference: new Map(), project: new Map(),
  }
  for (const claim of normalizedClaims) {
    addOntologyEntity(entityMaps, claim.subject.type, claim.subject.sourceId, claim.subject.label, claim.version, claim.updatedAt)
    addOntologyEntity(entityMaps, claim.object.type, claim.object.sourceId, claim.object.label, claim.version, claim.updatedAt)
  }
  for (const assessment of normalizedCompatibility) {
    for (const useCase of assessment.useCases) addOntologyEntity(entityMaps, 'use_case', useCase, useCase.replace(/-/g, ' '), assessment.version, assessment.updatedAt)
    for (const preference of assessment.preferences) addOntologyEntity(entityMaps, 'listening_preference', '', preference, assessment.version, assessment.updatedAt)
  }
  const chunkEntityRefs = chunkDocs.flatMap((document) => {
    const refs = Array.isArray(document.entityRefs) ? document.entityRefs : []
    return refs.map((value) => {
      const reference = value && typeof value === 'object' ? value as Record<string, unknown> : {}
      const type = normalizedEntityType(reference.type)
      const sourceId = String(reference.sourceId || '')
      const label = String(reference.label || '')
      addOntologyEntity(entityMaps, type, sourceId, label, Number(document.articleVersion) || 1, document.sourceUpdatedAt)
      return {
        chunkKey: sourceKey('chunk', String(document.id || '')),
        articleKey: sourceKey('article', String(document.articleId || '')),
        entityKey: entitySourceKey(type, sourceId, label),
        entityType: type,
      }
    }).filter((value) => value.entityKey)
  })

  const concepts = Array.from(entityMaps.concept.values())
  const problems = Array.from(entityMaps.problem.values())
  const solutions = Array.from(entityMaps.solution.values())
  const useCases = Array.from(entityMaps.use_case.values())
  const listeningPreferences = Array.from(entityMaps.listening_preference.values())
  const projects = Array.from(entityMaps.project.values())

  const claimSubjectRelations = normalizedClaims.flatMap((claim) => {
    const targetKey = entitySourceKey(claim.subject.type, claim.subject.sourceId, claim.subject.label)
    return targetKey ? [{ claimKey: sourceKey('claim', claim.id), targetKey }] : []
  })
  const claimObjectRelations = normalizedClaims.flatMap((claim) => {
    const targetKey = entitySourceKey(claim.object.type, claim.object.sourceId, claim.object.label)
    return targetKey ? [{ claimKey: sourceKey('claim', claim.id), targetKey }] : []
  })
  const problemCauseRelations = normalizedClaims.flatMap((claim) => {
    if (!['may_be_caused_by', 'caused_by'].includes(claim.predicate) || normalizedEntityType(claim.subject.type) !== 'problem' || normalizedEntityType(claim.object.type) !== 'concept') return []
    const problemKey = entitySourceKey(claim.subject.type, claim.subject.sourceId, claim.subject.label)
    const conceptKey = entitySourceKey(claim.object.type, claim.object.sourceId, claim.object.label)
    return problemKey && conceptKey ? [{ problemKey, conceptKey }] : []
  })
  const problemSolutionRelations = normalizedClaims.flatMap((claim) => {
    if (!['has_solution', 'solved_by'].includes(claim.predicate) || normalizedEntityType(claim.subject.type) !== 'problem' || normalizedEntityType(claim.object.type) !== 'solution') return []
    const problemKey = entitySourceKey(claim.subject.type, claim.subject.sourceId, claim.subject.label)
    const solutionKey = entitySourceKey(claim.object.type, claim.object.sourceId, claim.object.label)
    return problemKey && solutionKey ? [{ problemKey, solutionKey }] : []
  })
  const projectProductRelations = normalizedClaims.flatMap((claim) => {
    if (!['uses', 'uses_product'].includes(claim.predicate) || normalizedEntityType(claim.subject.type) !== 'project' || normalizedEntityType(claim.object.type) !== 'product') return []
    const projectKey = entitySourceKey(claim.subject.type, claim.subject.sourceId, claim.subject.label)
    const productKey = entitySourceKey(claim.object.type, claim.object.sourceId, claim.object.label)
    return projectKey && productKey ? [{ projectKey, productKey }] : []
  })

  return {
    products, brands, categories, articles, chunks, sources, claims, compatibility,
    concepts, problems, solutions, useCases, listeningPreferences, projects,
    productBrandRelations: products.filter((row) => row.brandId).map((row) => ({ productKey: row.sourceKey, brandKey: sourceKey('brand', String(row.brandId)) })),
    productCategoryRelations: products.filter((row) => row.categoryId).map((row) => ({ productKey: row.sourceKey, categoryKey: sourceKey('category', String(row.categoryId)) })),
    articleChunkRelations: chunks.map((row) => ({ articleKey: sourceKey('article', String(row.articleId)), chunkKey: row.sourceKey })),
    articleProductRelations: chunkEntityRefs.filter((row) => row.entityType === 'product').map((row) => ({ articleKey: row.articleKey, productKey: row.entityKey! })),
    chunkConceptRelations: chunkEntityRefs.filter((row) => row.entityType === 'concept').map((row) => ({ chunkKey: row.chunkKey, conceptKey: row.entityKey! })),
    chunkProblemRelations: chunkEntityRefs.filter((row) => row.entityType === 'problem').map((row) => ({ chunkKey: row.chunkKey, problemKey: row.entityKey! })),
    claimSubjectRelations,
    claimObjectRelations,
    claimSourceRelations: claims.flatMap((row) => (row.sourceIds as string[]).map((id) => ({ claimKey: row.sourceKey, sourceKey: sourceKey('source', id) }))),
    compatibilityProductRelations: compatibility.flatMap((row) => (row.componentIds as string[]).map((id) => ({ assessmentKey: row.sourceKey, productKey: sourceKey('product', id) }))),
    compatibilityUseCaseRelations: normalizedCompatibility.flatMap((assessment) => assessment.useCases.map((useCase) => ({ assessmentKey: sourceKey('compatibility', assessment.id), useCaseKey: sourceKey('use_case', stableEntityId('use_case', useCase, useCase)) }))),
    compatibilityPreferenceRelations: normalizedCompatibility.flatMap((assessment) => assessment.preferences.map((preference) => ({ assessmentKey: sourceKey('compatibility', assessment.id), preferenceKey: sourceKey('listening_preference', stableEntityId('listening_preference', '', preference)) }))),
    compatibilitySourceRelations: compatibility.flatMap((row) => (row.sourceIds as string[]).map((id) => ({ assessmentKey: row.sourceKey, sourceKey: sourceKey('source', id) }))),
    problemCauseRelations,
    problemSolutionRelations,
    projectProductRelations,
  }
}

const constraints = [
  'CREATE CONSTRAINT product_source_key IF NOT EXISTS FOR (n:Product) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT brand_source_key IF NOT EXISTS FOR (n:Brand) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT category_source_key IF NOT EXISTS FOR (n:Category) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT article_source_key IF NOT EXISTS FOR (n:Article) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT chunk_source_key IF NOT EXISTS FOR (n:Chunk) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT source_source_key IF NOT EXISTS FOR (n:Source) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT claim_source_key IF NOT EXISTS FOR (n:Claim) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT compatibility_source_key IF NOT EXISTS FOR (n:CompatibilityAssessment) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT concept_source_key IF NOT EXISTS FOR (n:Concept) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT problem_source_key IF NOT EXISTS FOR (n:Problem) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT solution_source_key IF NOT EXISTS FOR (n:Solution) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT use_case_source_key IF NOT EXISTS FOR (n:UseCase) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT listening_preference_source_key IF NOT EXISTS FOR (n:ListeningPreference) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE CONSTRAINT project_source_key IF NOT EXISTS FOR (n:Project) REQUIRE n.sourceKey IS UNIQUE',
  'CREATE INDEX concept_normalized_name IF NOT EXISTS FOR (n:Concept) ON (n.normalizedName)',
  'CREATE INDEX problem_normalized_name IF NOT EXISTS FOR (n:Problem) ON (n.normalizedName)',
  'CREATE INDEX article_slug IF NOT EXISTS FOR (n:Article) ON (n.slug)',
  'CREATE INDEX product_slug IF NOT EXISTS FOR (n:Product) ON (n.slug)',
]

const nodeStatements: Array<{ key: keyof GraphProjectionSnapshot; label: string }> = [
  { key: 'products', label: 'Product' }, { key: 'brands', label: 'Brand' }, { key: 'categories', label: 'Category' },
  { key: 'articles', label: 'Article' }, { key: 'chunks', label: 'Chunk' }, { key: 'sources', label: 'Source' },
  { key: 'claims', label: 'Claim' }, { key: 'compatibility', label: 'CompatibilityAssessment' },
  { key: 'concepts', label: 'Concept' }, { key: 'problems', label: 'Problem' }, { key: 'solutions', label: 'Solution' },
  { key: 'useCases', label: 'UseCase' }, { key: 'listeningPreferences', label: 'ListeningPreference' }, { key: 'projects', label: 'Project' },
]

const relationStatements: Array<{ key: keyof GraphProjectionSnapshot; type: string; statement: string }> = [
  { key: 'productBrandRelations', type: 'MADE_BY', statement: 'UNWIND $rows AS row MATCH (p:Product {sourceKey: row.productKey}), (b:Brand {sourceKey: row.brandKey}) MERGE (p)-[:MADE_BY]->(b)' },
  { key: 'productCategoryRelations', type: 'IN_CATEGORY', statement: 'UNWIND $rows AS row MATCH (p:Product {sourceKey: row.productKey}), (c:Category {sourceKey: row.categoryKey}) MERGE (p)-[:IN_CATEGORY]->(c)' },
  { key: 'articleChunkRelations', type: 'HAS_CHUNK', statement: 'UNWIND $rows AS row MATCH (a:Article {sourceKey: row.articleKey}), (c:Chunk {sourceKey: row.chunkKey}) MERGE (a)-[:HAS_CHUNK]->(c)' },
  { key: 'articleProductRelations', type: 'MENTIONS', statement: 'UNWIND $rows AS row MATCH (a:Article {sourceKey: row.articleKey}), (p:Product {sourceKey: row.productKey}) MERGE (a)-[:MENTIONS]->(p)' },
  { key: 'chunkConceptRelations', type: 'MENTIONS', statement: 'UNWIND $rows AS row MATCH (c:Chunk {sourceKey: row.chunkKey}), (n:Concept {sourceKey: row.conceptKey}) MERGE (c)-[:MENTIONS]->(n)' },
  { key: 'chunkProblemRelations', type: 'DISCUSSES', statement: 'UNWIND $rows AS row MATCH (c:Chunk {sourceKey: row.chunkKey}), (p:Problem {sourceKey: row.problemKey}) MERGE (c)-[:DISCUSSES]->(p)' },
  { key: 'claimSubjectRelations', type: 'SUBJECT', statement: 'UNWIND $rows AS row MATCH (c:Claim {sourceKey: row.claimKey}), (n {sourceKey: row.targetKey}) MERGE (c)-[:SUBJECT]->(n)' },
  { key: 'claimObjectRelations', type: 'OBJECT', statement: 'UNWIND $rows AS row MATCH (c:Claim {sourceKey: row.claimKey}), (n {sourceKey: row.targetKey}) MERGE (c)-[:OBJECT]->(n)' },
  { key: 'claimSourceRelations', type: 'SUPPORTED_BY', statement: 'UNWIND $rows AS row MATCH (c:Claim {sourceKey: row.claimKey}), (s:Source {sourceKey: row.sourceKey}) MERGE (c)-[:SUPPORTED_BY]->(s)' },
  { key: 'compatibilityProductRelations', type: 'ASSESSES', statement: 'UNWIND $rows AS row MATCH (a:CompatibilityAssessment {sourceKey: row.assessmentKey}), (p:Product {sourceKey: row.productKey}) MERGE (a)-[:ASSESSES]->(p)' },
  { key: 'compatibilityUseCaseRelations', type: 'FOR_USE_CASE', statement: 'UNWIND $rows AS row MATCH (a:CompatibilityAssessment {sourceKey: row.assessmentKey}), (u:UseCase {sourceKey: row.useCaseKey}) MERGE (a)-[:FOR_USE_CASE]->(u)' },
  { key: 'compatibilityPreferenceRelations', type: 'PREFERS', statement: 'UNWIND $rows AS row MATCH (a:CompatibilityAssessment {sourceKey: row.assessmentKey}), (p:ListeningPreference {sourceKey: row.preferenceKey}) MERGE (a)-[:PREFERS]->(p)' },
  { key: 'compatibilitySourceRelations', type: 'SUPPORTED_BY', statement: 'UNWIND $rows AS row MATCH (a:CompatibilityAssessment {sourceKey: row.assessmentKey}), (s:Source {sourceKey: row.sourceKey}) MERGE (a)-[:SUPPORTED_BY]->(s)' },
  { key: 'problemCauseRelations', type: 'MAY_BE_CAUSED_BY', statement: 'UNWIND $rows AS row MATCH (p:Problem {sourceKey: row.problemKey}), (c:Concept {sourceKey: row.conceptKey}) MERGE (p)-[:MAY_BE_CAUSED_BY]->(c)' },
  { key: 'problemSolutionRelations', type: 'HAS_SOLUTION', statement: 'UNWIND $rows AS row MATCH (p:Problem {sourceKey: row.problemKey}), (s:Solution {sourceKey: row.solutionKey}) MERGE (p)-[:HAS_SOLUTION]->(s)' },
  { key: 'projectProductRelations', type: 'USES', statement: 'UNWIND $rows AS row MATCH (j:Project {sourceKey: row.projectKey}), (p:Product {sourceKey: row.productKey}) MERGE (j)-[:USES]->(p)' },
]

export async function applyGraphProjection(snapshot: GraphProjectionSnapshot, options: { prune?: boolean } = {}) {
  if (options.prune) await runNeo4jProjectionWrite('MATCH (n) WHERE n.projection = $projection DETACH DELETE n', { projection: projectionName })
  for (const statement of constraints) await runNeo4jProjectionWrite(statement)
  for (const item of nodeStatements) {
    const rows = snapshot[item.key] as GraphProjectionRow[]
    if (rows.length) await runNeo4jProjectionWrite(`UNWIND $rows AS row MERGE (n:${item.label} {sourceKey: row.sourceKey}) SET n += row`, { rows })
  }
  for (const item of relationStatements) {
    const rows = snapshot[item.key] as GraphProjectionRow[]
    if (rows.length) await runNeo4jProjectionWrite(item.statement, { rows })
  }
  const now = new Date().toISOString()
  await (await getDb()).collection('graph_sync_state').updateOne(
    { key: 'projection-v1' },
    { $set: { key: 'projection-v1', projection: projectionName, lastRebuildAt: now, counts: projectionCounts(snapshot), updatedAt: now } },
    { upsert: true },
  )
  return projectionCounts(snapshot)
}

export function projectionCounts(snapshot: GraphProjectionSnapshot) {
  return Object.fromEntries(nodeStatements.map((item) => [item.label, (snapshot[item.key] as GraphProjectionRow[]).length]))
}

export function projectionRelationCounts(snapshot: GraphProjectionSnapshot) {
  const counts: Record<string, number> = {}
  for (const item of relationStatements) counts[item.type] = (counts[item.type] || 0) + (snapshot[item.key] as GraphProjectionRow[]).length
  return counts
}

export async function verifyGraphProjection(snapshot?: GraphProjectionSnapshot): Promise<GraphVerificationReport> {
  const generatedAt = new Date().toISOString()
  const current = snapshot || await buildGraphProjectionSnapshot()
  const mongoCounts = projectionCounts(current)
  const relationCounts = projectionRelationCounts(current)
  const health = await getNeo4jHealth()
  if (!health.available) return { available: false, generatedAt, mongoCounts, graphCounts: {}, drift: {}, relationCounts, graphRelationCounts: {}, relationDrift: {}, missingNodes: 0, unexpectedNodes: 0, hashMismatches: 0, healthy: false, errorCode: health.errorCode }
  const [nodeRows, graphRelations] = await Promise.all([
    runNeo4jRead('MATCH (n) WHERE n.projection = $projection RETURN labels(n)[0] AS label, n.sourceKey AS sourceKey, n.syncHash AS syncHash', { projection: projectionName }),
    runNeo4jRead('MATCH (a)-[r]->(b) WHERE a.projection = $projection AND b.projection = $projection RETURN type(r) AS type, count(r) AS count', { projection: projectionName }),
  ])
  const graphCounts: Record<string, number> = {}
  for (const row of nodeRows) {
    const label = String(row.label || '')
    graphCounts[label] = (graphCounts[label] || 0) + 1
  }
  const graphRelationCounts = Object.fromEntries(graphRelations.map((row) => [String(row.type || ''), Number(row.count) || 0]))
  const drift = Object.fromEntries(Object.entries(mongoCounts).map(([label, count]) => [label, (graphCounts[label] || 0) - count]))
  const relationDrift = Object.fromEntries(Object.entries(relationCounts).map(([type, count]) => [type, (graphRelationCounts[type] || 0) - count]))
  const expectedNodes = new Map(nodeStatements.flatMap((item) => (current[item.key] as GraphProjectionRow[]).map((row) => [String(row.sourceKey), String(row.syncHash)] as const)))
  const graphNodes = new Map(nodeRows.map((row) => [String(row.sourceKey || ''), String(row.syncHash || '')] as const))
  const missingNodes = Array.from(expectedNodes.keys()).filter((key) => !graphNodes.has(key)).length
  const unexpectedNodes = Array.from(graphNodes.keys()).filter((key) => !expectedNodes.has(key)).length
  const hashMismatches = Array.from(expectedNodes).filter(([key, hash]) => graphNodes.has(key) && graphNodes.get(key) !== hash).length
  const healthy = Object.values(drift).every((value) => value === 0)
    && Object.values(relationDrift).every((value) => value === 0)
    && missingNodes === 0 && unexpectedNodes === 0 && hashMismatches === 0
  const report = { available: true, generatedAt, mongoCounts, graphCounts, drift, relationCounts, graphRelationCounts, relationDrift, missingNodes, unexpectedNodes, hashMismatches, healthy, errorCode: healthy ? '' : 'GRAPH_DRIFT' }
  await (await getDb()).collection('graph_sync_state').updateOne(
    { key: 'projection-v1' },
    { $set: { lastVerifyAt: generatedAt, drift, healthy, updatedAt: generatedAt } },
    { upsert: true },
  )
  return report
}

export async function syncPendingGraphOutbox() {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
  const db = await getDb()
  const pending = await db.collection('graph_sync_outbox').find({ status: { $in: ['pending', 'failed'] }, availableAt: { $lte: new Date().toISOString() } }).limit(500).toArray()
  if (!pending.length) return { processed: 0, counts: {} }
  const ids = pending.map((item) => item.id)
  await db.collection('graph_sync_outbox').updateMany({ id: { $in: ids } }, { $set: { status: 'processing', updatedAt: new Date().toISOString() } })
  try {
    const snapshot = await buildGraphProjectionSnapshot()
    const counts = await applyGraphProjection(snapshot, { prune: true })
    await db.collection('graph_sync_outbox').updateMany({ id: { $in: ids } }, { $set: { status: 'completed', lastError: '', updatedAt: new Date().toISOString() } })
    return { processed: ids.length, counts }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GRAPH_SYNC_FAILED'
    await db.collection('graph_sync_outbox').updateMany({ id: { $in: ids } }, { $set: { status: 'failed', lastError: message.slice(0, 200), updatedAt: new Date().toISOString() }, $inc: { attempts: 1 } })
    throw error
  }
}
