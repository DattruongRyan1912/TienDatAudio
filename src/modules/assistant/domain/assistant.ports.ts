import type {
  AssistantBusinessProfile,
  AssistantConversationConstraints,
  AssistantKnowledgeDocument,
  AssistantMessage,
  AssistantProductFact,
} from './types'
import type { CompatibilityAssessment } from '@/modules/knowledge/domain/types'
import type { AssistantToolCall, AssistantToolSelectorInput } from './tool-calling'

export type AssistantAnswerGeneratorInput = {
  messages: AssistantMessage[]
  context: string
  intent?: string
}

export type AssistantGraphRecommendation = {
  assessmentId: string
  productIds: string[]
  sourceIds: string[]
  path: string[]
  score: number
}

export type AssistantGraphQuery = {
  constraints: AssistantConversationConstraints
  assessmentIds: string[]
  productIds: string[]
}

export type AssistantPorts = {
  exactFactsEnabled: boolean
  toolsEnabled?: boolean
  loadBusinessProfile: () => Promise<AssistantBusinessProfile>
  listProducts: () => Promise<AssistantProductFact[]>
  listKnowledge: (query?: string) => Promise<AssistantKnowledgeDocument[]>
  generateAnswer: (input: AssistantAnswerGeneratorInput) => Promise<string>
  selectTools?: (input: AssistantToolSelectorInput) => Promise<AssistantToolCall[]>
  listVerifiedCompatibility?: () => Promise<CompatibilityAssessment[]>
  queryGraphRecommendations?: (input: AssistantGraphQuery) => Promise<AssistantGraphRecommendation[]>
  knowledgeEnabled?: boolean
  advisorEnabled?: boolean
  graphMode?: 'off' | 'shadow' | 'public'
}
