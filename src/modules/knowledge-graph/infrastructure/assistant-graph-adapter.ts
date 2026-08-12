import type { AssistantGraphQuery, AssistantGraphRecommendation } from '@/modules/assistant/domain/assistant.ports'
import { runNeo4jRead } from './neo4j-http-client'

const recommendationQuery = `
MATCH (assessment:CompatibilityAssessment)-[:ASSESSES]->(product:Product)
WHERE assessment.mongoId IN $assessmentIds AND product.mongoId IN $productIds
OPTIONAL MATCH (assessment)-[:SUPPORTED_BY]->(source:Source)
RETURN assessment.mongoId AS assessmentId,
       collect(DISTINCT product.mongoId) AS productIds,
       collect(DISTINCT source.mongoId) AS sourceIds,
       collect(DISTINCT product.name) AS path,
       assessment.confidence AS score
ORDER BY score DESC
LIMIT 20
`

export async function queryGraphRecommendations(input: AssistantGraphQuery): Promise<AssistantGraphRecommendation[]> {
  if (!input.assessmentIds.length || !input.productIds.length) return []
  const rows = await runNeo4jRead(recommendationQuery, {
    assessmentIds: input.assessmentIds.slice(0, 100),
    productIds: input.productIds.slice(0, 200),
  })
  return rows.map((row) => ({
    assessmentId: String(row.assessmentId || ''),
    productIds: Array.isArray(row.productIds) ? row.productIds.map(String) : [],
    sourceIds: Array.isArray(row.sourceIds) ? row.sourceIds.map(String) : [],
    path: Array.isArray(row.path) ? row.path.map(String) : [],
    score: Math.min(1, Math.max(0, Number(row.score) || 0)),
  })).filter((row) => row.assessmentId && row.productIds.length)
}
