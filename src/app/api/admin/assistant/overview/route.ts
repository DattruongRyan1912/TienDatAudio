import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { assistantOperationsOverview } from '@/modules/assistant/infrastructure/assistant-operations-repository'
import {
  assistantAdvisorEnabled,
  assistantConversationsEnabled,
  assistantExactFactsEnabled,
  assistantGraphMode,
  assistantKnowledgeEnabled,
  assistantRolloutMode,
  assistantToolsEnabled,
} from '@/modules/assistant/infrastructure/assistant-config'
import { knowledgeOperationsOverview } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { getNeo4jHealth } from '@/modules/knowledge-graph/infrastructure/neo4j-http-client'
import { knowledgeErrorResponse } from '@/modules/knowledge/presentation/knowledge-http'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const [knowledge, conversations, graph] = await Promise.all([
      knowledgeOperationsOverview(),
      assistantOperationsOverview(),
      getNeo4jHealth(),
    ])
    return NextResponse.json({
      success: true,
      data: {
        rollout: assistantRolloutMode(),
        flags: {
          exactFacts: assistantExactFactsEnabled(),
          tools: assistantToolsEnabled(),
          knowledge: assistantKnowledgeEnabled(),
          advisor: assistantAdvisorEnabled(),
          conversations: assistantConversationsEnabled(),
          graphMode: assistantGraphMode(),
        },
        knowledge,
        conversations,
        graph,
      },
    })
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
