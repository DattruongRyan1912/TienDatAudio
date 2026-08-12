export type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantIntent =
  | 'business_contact'
  | 'business_location'
  | 'business_hours'
  | 'business_identity'
  | 'product_lookup'
  | 'product_price'
  | 'product_availability'
  | 'product_specification'
  | 'product_comparison'
  | 'knowledge_question'
  | 'troubleshooting'
  | 'article_discovery'
  | 'product_recommendation'
  | 'system_recommendation'
  | 'contact_conversion'
  | 'out_of_scope'

export type AssistantExactIntent =
  | 'business_contact'
  | 'business_location'
  | 'business_hours'
  | 'business_identity'
  | 'product_price'
  | 'product_availability'
  | 'product_specification'

export type AssistantSourceType = 'business' | 'product' | 'knowledge' | 'article' | 'claim' | 'compatibility'

export type AssistantSource = {
  id: string
  type: AssistantSourceType
  title: string
  url?: string
  excerpt?: string
  authority: number
  updatedAt?: string
}

export type AssistantKnowledgeDocument = AssistantSource & {
  content: string
  titleTerms: string
  keywordTerms: string
  bodyTerms: string
  reviewStatus?: string
  validUntil?: string
}

export type AssistantAction = {
  type: 'call' | 'zalo' | 'map' | 'contact_form' | 'product' | 'article'
  label: string
  href: string
}

export type AssistantRecommendation = {
  productId: string
  name: string
  url: string
  imageUrl?: string
  price: number | null
  inStock: boolean | null
  score: number
  reasons: string[]
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

export type AssistantTrace = {
  stages: Array<{ name: string; latencyMs: number; outcome: string }>
  validator: { passed: boolean; violations: string[] }
  graph: { enabled: boolean; available: boolean; mode: string; template?: string }
}

export type AssistantAnswer = {
  answerKind: 'exact' | 'generated' | 'clarification' | 'fallback'
  intent: AssistantIntent
  answer: string
  confidence: number
  sources: AssistantSource[]
  actions: AssistantAction[]
  recommendations?: AssistantRecommendation[]
  followUpQuestions?: string[]
  constraints?: AssistantConversationConstraints
  needsHuman: boolean
  trace?: AssistantTrace
}

export type AssistantResponse = AssistantAnswer & {
  requestId: string
}

export type AssistantBusinessProfile = {
  name?: string
  alternateName?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  businessHours: string[]
  mapUrl?: string
  updatedAt?: string
}

export type AssistantProductFact = {
  id: string
  name: string
  slug: string
  brand?: string
  price: number | null
  salePrice: number | null
  inStock: boolean | null
  specifications: Record<string, string | string[]>
  category?: string
  categoryId?: string
  brandId?: string
  description?: string
  features?: string[]
  imageUrl?: string
  updatedAt?: string
}
