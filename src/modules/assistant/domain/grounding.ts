import type { AssistantKnowledgeDocument, AssistantProductFact, AssistantRecommendation } from './types'

export type GroundingResult = { passed: boolean; violations: string[] }

function normalizedFact(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function answerNumbers(answer: string) {
  return Array.from(new Set(answer.match(/(?<![\p{L}\d])\d[\d.,]*(?:\s*(?:đ|vnd|w|kw|hz|khz|ohm|kg|m2|m²|cm|mm))?/giu) || []))
}

function answerUrls(answer: string) {
  return Array.from(new Set(answer.match(/https?:\/\/[^\s)\]]+/g) || []))
}

export function validateGroundedAnswer(input: {
  answer: string
  evidence: AssistantKnowledgeDocument[]
  products?: AssistantProductFact[]
  recommendations?: AssistantRecommendation[]
}) : GroundingResult {
  const violations: string[] = []
  const context = normalizedFact(input.evidence.map((item) => item.content).join('\n'))
  const citationIds = new Set(input.evidence.map((_, index) => `[${index + 1}]`))
  if (input.evidence.length && !Array.from(citationIds).some((citation) => input.answer.includes(citation))) violations.push('MISSING_CITATION')

  for (const number of answerNumbers(input.answer)) {
    const normalized = normalizedFact(number)
    const digits = normalized.replace(/\D/g, '')
    if (digits.length <= 1) continue
    if (!context.includes(normalized) && !context.replace(/\D/g, '').includes(digits)) violations.push(`UNSUPPORTED_NUMBER:${number}`)
  }
  if (answerUrls(input.answer).length) violations.push('MODEL_URL_NOT_ALLOWED')

  const allowedProductIds = new Set((input.products || []).map((product) => product.id))
  for (const recommendation of input.recommendations || []) {
    if (!allowedProductIds.has(recommendation.productId)) violations.push(`UNKNOWN_RECOMMENDATION:${recommendation.productId}`)
  }
  return { passed: violations.length === 0, violations }
}
