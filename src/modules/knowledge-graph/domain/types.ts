export type GraphConnectionRole = 'reader' | 'writer'

export type GraphHealth = {
  enabled: boolean
  available: boolean
  database: string
  latencyMs: number
  errorCode: string
}

export type GraphProjectionRow = Record<string, string | number | boolean | null | string[] | number[]>

export type GraphProjectionSnapshot = {
  products: GraphProjectionRow[]
  brands: GraphProjectionRow[]
  categories: GraphProjectionRow[]
  articles: GraphProjectionRow[]
  chunks: GraphProjectionRow[]
  sources: GraphProjectionRow[]
  claims: GraphProjectionRow[]
  compatibility: GraphProjectionRow[]
  concepts: GraphProjectionRow[]
  problems: GraphProjectionRow[]
  solutions: GraphProjectionRow[]
  useCases: GraphProjectionRow[]
  listeningPreferences: GraphProjectionRow[]
  projects: GraphProjectionRow[]
  productBrandRelations: GraphProjectionRow[]
  productCategoryRelations: GraphProjectionRow[]
  articleChunkRelations: GraphProjectionRow[]
  articleProductRelations: GraphProjectionRow[]
  chunkConceptRelations: GraphProjectionRow[]
  chunkProblemRelations: GraphProjectionRow[]
  claimSubjectRelations: GraphProjectionRow[]
  claimObjectRelations: GraphProjectionRow[]
  claimSourceRelations: GraphProjectionRow[]
  compatibilityProductRelations: GraphProjectionRow[]
  compatibilityUseCaseRelations: GraphProjectionRow[]
  compatibilityPreferenceRelations: GraphProjectionRow[]
  compatibilitySourceRelations: GraphProjectionRow[]
  problemCauseRelations: GraphProjectionRow[]
  problemSolutionRelations: GraphProjectionRow[]
  projectProductRelations: GraphProjectionRow[]
}

export type GraphVerificationReport = {
  available: boolean
  generatedAt: string
  mongoCounts: Record<string, number>
  graphCounts: Record<string, number>
  drift: Record<string, number>
  relationCounts: Record<string, number>
  graphRelationCounts: Record<string, number>
  relationDrift: Record<string, number>
  missingNodes: number
  unexpectedNodes: number
  hashMismatches: number
  healthy: boolean
  errorCode: string
}
