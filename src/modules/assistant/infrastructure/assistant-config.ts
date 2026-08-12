export function assistantExactFactsEnabled() {
  const value = process.env.ASSISTANT_EXACT_FACTS_ENABLED?.trim().toLowerCase()
  return value !== '0' && value !== 'false' && value !== 'off' && value !== 'no'
}

export type AssistantRolloutMode = 'off' | 'admin_only' | 'exact_public' | 'knowledge_public' | 'graph_shadow' | 'graph_public' | 'advisor_public'

const rolloutModes: AssistantRolloutMode[] = ['off', 'admin_only', 'exact_public', 'knowledge_public', 'graph_shadow', 'graph_public', 'advisor_public']

function booleanSetting(name: string, fallback: boolean) {
  const value = process.env[name]?.trim().toLowerCase()
  if (!value) return fallback
  return !['0', 'false', 'off', 'no'].includes(value)
}

export function assistantRolloutMode(): AssistantRolloutMode {
  const value = process.env.ASSISTANT_ROLLOUT_MODE?.trim().toLowerCase() as AssistantRolloutMode | undefined
  return value && rolloutModes.includes(value) ? value : 'knowledge_public'
}

export function assistantPublicEnabled() {
  return !['off', 'admin_only'].includes(assistantRolloutMode())
}

export function assistantKnowledgeEnabled() {
  const mode = assistantRolloutMode()
  return booleanSetting('ASSISTANT_KNOWLEDGE_ENABLED', !['off', 'admin_only', 'exact_public'].includes(mode))
}

export function assistantAdvisorEnabled() {
  return booleanSetting('ASSISTANT_ADVISOR_ENABLED', assistantRolloutMode() === 'advisor_public')
}

export function assistantGraphMode(): 'off' | 'shadow' | 'public' {
  const mode = assistantRolloutMode()
  if (!booleanSetting('ASSISTANT_GRAPH_ENABLED', ['graph_shadow', 'graph_public', 'advisor_public'].includes(mode))) return 'off'
  return mode === 'graph_shadow' ? 'shadow' : ['graph_public', 'advisor_public'].includes(mode) ? 'public' : 'off'
}

export function assistantConversationsEnabled() {
  return booleanSetting('ASSISTANT_CONVERSATIONS_ENABLED', true)
}
