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
  isActive: boolean
  updatedAt: string
}

export interface SEOFAQ {
  id: string
  question: string
  answer: string
}

export interface SEOEntityProfile {
  name: string
  alternateName: string
  description: string
  url: string
  logo: string
  phone: string
  email: string
  address: string
  areaServed: string[]
  latitude?: number
  longitude?: number
  sameAs: string[]
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
  entity: SEOEntityProfile
  keywords: SEOKeyword[]
  ai: AIOConfig
  updatedAt: string
}
