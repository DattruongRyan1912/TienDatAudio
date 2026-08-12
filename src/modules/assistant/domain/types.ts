export type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantSourceType = 'product' | 'article'

export type AssistantSource = {
  id: string
  type: AssistantSourceType
  title: string
  url: string
  excerpt: string
}

export type AssistantKnowledgeDocument = AssistantSource & {
  content: string
  titleTerms: string
  keywordTerms: string
  bodyTerms: string
}

export type AssistantAnswer = {
  answer: string
  sources: AssistantSource[]
}
