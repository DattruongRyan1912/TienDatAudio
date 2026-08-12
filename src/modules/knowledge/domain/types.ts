export const KNOWLEDGE_ENTRY_TYPES = ['faq', 'policy', 'service', 'guide'] as const
export type KnowledgeEntryType = typeof KNOWLEDGE_ENTRY_TYPES[number]

export const KNOWLEDGE_ENTRY_STATUSES = ['draft', 'review', 'published', 'archived'] as const
export type KnowledgeEntryStatus = typeof KNOWLEDGE_ENTRY_STATUSES[number]

export const EVIDENCE_REVIEW_STATUSES = ['suggested', 'review', 'verified', 'rejected', 'archived'] as const
export type EvidenceReviewStatus = typeof EVIDENCE_REVIEW_STATUSES[number]

export const KNOWLEDGE_SOURCE_TYPES = ['manufacturer', 'official_documentation', 'verified_internal', 'expert_note'] as const
export type KnowledgeSourceType = typeof KNOWLEDGE_SOURCE_TYPES[number]

export const COMPATIBILITY_VERDICTS = ['recommended', 'conditional', 'not_recommended'] as const
export type CompatibilityVerdict = typeof COMPATIBILITY_VERDICTS[number]

export type KnowledgeEntry = {
  id: string
  slug: string
  type: KnowledgeEntryType
  title: string
  answerMarkdown: string
  aliases: string[]
  tags: string[]
  priority: number
  reviewStatus: KnowledgeEntryStatus
  sourceIds: string[]
  validFrom: string | null
  expiresAt: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export type KnowledgeEntryRevision = {
  id: string
  entryId: string
  version: number
  snapshot: KnowledgeEntry
  action: 'updated' | 'reviewed' | 'published' | 'archived' | 'restored'
  actor: string
  createdAt: string
}

export type KnowledgeSource = {
  id: string
  type: KnowledgeSourceType
  organization: string
  title: string
  url: string
  retrievedAt: string | null
  reviewStatus: EvidenceReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  checksum: string
  version: number
  createdAt: string
  updatedAt: string
}

export type KnowledgeEntityRef = {
  type: string
  sourceId: string
  label: string
}

export type KnowledgeClaimObject = {
  type: string
  sourceId: string | null
  value: string | null
  label: string
}

export type KnowledgeClaim = {
  id: string
  subject: KnowledgeEntityRef
  predicate: string
  object: KnowledgeClaimObject
  reason: string
  sourceIds: string[]
  reviewStatus: EvidenceReviewStatus
  confidence: number
  verifiedBy: string | null
  verifiedAt: string | null
  validFrom: string | null
  expiresAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export type CompatibilityAssessment = {
  id: string
  componentIds: string[]
  room: { minM2: number | null; maxM2: number | null }
  useCases: string[]
  preferences: string[]
  verdict: CompatibilityVerdict
  reason: string
  sourceIds: string[]
  reviewStatus: EvidenceReviewStatus
  confidence: number
  verifiedBy: string | null
  verifiedAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export type ArticleChunk = {
  id: string
  articleId: string
  articleSlug: string
  articleTitle: string
  articleVersion: number
  chunkIndex: number
  headingPath: string[]
  text: string
  normalizedText: string
  tokenCount: number
  entityRefs: KnowledgeEntityRef[]
  sourceUpdatedAt: string
  contentHash: string
  embedding?: number[]
  embeddingModel?: string
  embeddingVersion?: string
  createdAt: string
  updatedAt: string
}

export type GraphSyncStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type GraphSyncOutboxItem = {
  id: string
  aggregateType: 'product' | 'brand' | 'category' | 'article' | 'knowledge' | 'source' | 'claim' | 'compatibility'
  aggregateId: string
  aggregateVersion: number
  operation: 'upsert' | 'delete'
  status: GraphSyncStatus
  attempts: number
  availableAt: string
  lastError: string
  createdAt: string
  updatedAt: string
}

export type AssistantConversationConstraints = {
  roomSizeM2?: number
  budgetMin?: number
  budgetMax?: number
  useCases?: Array<'music' | 'karaoke' | 'cinema' | 'event'>
  musicPreferences?: string[]
  ownedProductIds?: string[]
  preferredBrandIds?: string[]
  requestedComponent?: string
}

export type AssistantSession = {
  id: string
  constraints: AssistantConversationConstraints
  consent: 'anonymous_assistant'
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export type AssistantStoredMessage = {
  id: string
  sessionId: string
  requestId: string
  role: 'user' | 'assistant'
  content: string
  intent: string
  answerKind: string
  sourceIds: string[]
  confidence: number
  needsHuman: boolean
  latencyMs: number
  modelLatencyMs: number
  graphLatencyMs: number
  validatorOutcome: 'not_run' | 'passed' | 'failed'
  errorCode: string
  createdAt: string
  expiresAt: string
}

export type AssistantFeedback = {
  id: string
  sessionId: string
  requestId: string
  helpful: boolean
  reason: string
  createdAt: string
  expiresAt: string
}

export type AssistantEvaluationResult = {
  id: string
  runId: string
  caseId: string
  datasetVersion: string
  expectedIntent: string
  actualIntent: string
  passed: boolean
  violations: string[]
  latencyMs: number
  sourceIds: string[]
  answerKind: string
  createdAt: string
}

export const KNOWLEDGE_RESOURCES = ['knowledge', 'sources', 'claims', 'compatibility'] as const
export type KnowledgeResourceName = typeof KNOWLEDGE_RESOURCES[number]

export type KnowledgeResourceMap = {
  knowledge: KnowledgeEntry
  sources: KnowledgeSource
  claims: KnowledgeClaim
  compatibility: CompatibilityAssessment
}

export type KnowledgeListFilters = {
  search?: string
  status?: string
  type?: string
  page?: number
  limit?: number
}

export type PaginatedKnowledge<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type KnowledgeMutationResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: 'NOT_FOUND' | 'VERSION_CONFLICT' | 'SLUG_CONFLICT'; current?: T }
