export type SEOKeywordIntent = 'transactional' | 'commercial' | 'informational' | 'local' | 'navigational'
export type SEOKeywordPriority = 'high' | 'medium' | 'low'

export interface SEOKeyword {
  id: string
  term: string
  intent: SEOKeywordIntent
  targetPage: string
  cluster: string
  priority: SEOKeywordPriority
  notes: string
  brief?: {
    audience: string
    angle: string
    questions: string[]
    secondaryTerms: string[]
    callToAction: string
  }
  isActive: boolean
  updatedAt: string
}

export interface SEOFAQ {
  id: string
  question: string
  answer: string
}

export interface AIOConfig {
  enabled: boolean
  positioning: string
  entityFacts: string[]
  services: string[]
  answerGuidelines: string[]
  faqs: SEOFAQ[]
  preferredSources: string[]
}

export interface SEOConfig {
  id: string
  keywords: SEOKeyword[]
  ai: AIOConfig
  updatedAt: string
}
