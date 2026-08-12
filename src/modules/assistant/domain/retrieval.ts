import type { AssistantKnowledgeDocument } from './types'

const STOP_WORDS = new Set([
  'ai', 'anh', 'ban', 'biet', 'cac', 'cai', 'can', 'cho', 'co', 'cua', 'duoc', 'gi', 'giup',
  'dang', 'de', 'gia', 'hay', 'hoi', 'khong', 'la', 'lam', 'minh', 'mot', 'muon', 'nao', 'nay',
  'nen', 'nhu', 'nhung', 'no', 'o', 'phu', 'san', 'pham', 'the', 'thi', 'toi', 'tu', 'va', 've',
  'voi', 'xin',
])

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLocaleLowerCase('vi')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function queryTerms(query: string) {
  return [...new Set(normalizeSearchText(query).split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term)))]
}

function occurrenceScore(haystack: string, terms: string[], weight: number) {
  return terms.reduce((score, term) => score + (haystack.includes(term) ? weight : 0), 0)
}

export function retrieveKnowledge(query: string, documents: AssistantKnowledgeDocument[], limit = 5) {
  const normalizedQuery = normalizeSearchText(query)
  const terms = queryTerms(query)
  if (!terms.length) return []

  return documents
    .map((document) => {
      let score = occurrenceScore(document.titleTerms, terms, 8)
      score += occurrenceScore(document.keywordTerms, terms, 5)
      score += occurrenceScore(document.bodyTerms, terms, 1)
      if (normalizedQuery.length > 5 && document.titleTerms.includes(normalizedQuery)) score += 18
      if (normalizedQuery.length > 5 && document.bodyTerms.includes(normalizedQuery)) score += 6
      return { document, score }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'vi'))
    .slice(0, Math.max(1, limit))
    .map((result) => result.document)
}
