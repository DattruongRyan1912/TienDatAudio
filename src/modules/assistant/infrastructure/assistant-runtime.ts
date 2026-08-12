import type { AssistantPorts } from '../domain/assistant.ports'
import {
  assistantAdvisorEnabled,
  assistantExactFactsEnabled,
  assistantGraphMode,
  assistantKnowledgeEnabled,
  assistantToolsEnabled,
} from './assistant-config'
import { createDeepSeekAnswer, selectDeepSeekTools } from './deepseek-client'
import { listAssistantProducts, loadAssistantBusinessProfile } from './exact-fact-repository'
import { listAssistantKnowledge } from './knowledge-repository'
import { listVerifiedCompatibility } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { queryGraphRecommendations } from '@/modules/knowledge-graph/infrastructure/assistant-graph-adapter'

export function createAssistantPorts(overrides: Partial<AssistantPorts> = {}): AssistantPorts {
  return {
    exactFactsEnabled: assistantExactFactsEnabled(),
    toolsEnabled: assistantToolsEnabled(),
    knowledgeEnabled: assistantKnowledgeEnabled(),
    advisorEnabled: assistantAdvisorEnabled(),
    graphMode: assistantGraphMode(),
    loadBusinessProfile: loadAssistantBusinessProfile,
    listProducts: listAssistantProducts,
    listKnowledge: listAssistantKnowledge,
    listVerifiedCompatibility,
    queryGraphRecommendations,
    generateAnswer: createDeepSeekAnswer,
    selectTools: selectDeepSeekTools,
    ...overrides,
  }
}
