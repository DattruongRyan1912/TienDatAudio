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
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function queryTerms(query: string) {
  return [...new Set(normalizeSearchText(query).split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term)))]
}

function matchingTerms(haystack: string, terms: string[]) {
  const tokens = new Set(haystack.split(/\s+/).filter(Boolean))
  return terms.filter((term) => tokens.has(term))
}

export function retrieveKnowledge(query: string, documents: AssistantKnowledgeDocument[], limit = 5) {
  const normalizedQuery = normalizeSearchText(query)
  const terms = queryTerms(query)
  if (!terms.length) return []

  return documents
    .map((document) => {
      const titleMatches = matchingTerms(document.titleTerms, terms)
      const keywordMatches = matchingTerms(document.keywordTerms, terms)
      const bodyMatches = matchingTerms(document.bodyTerms, terms)
      let score = titleMatches.length * 8
      score += keywordMatches.length * 5
      score += bodyMatches.length
      if (normalizedQuery.length > 5 && ` ${document.titleTerms} `.includes(` ${normalizedQuery} `)) score += 18
      if (normalizedQuery.length > 5 && ` ${document.bodyTerms} `.includes(` ${normalizedQuery} `)) score += 6
      const strongMatches = new Set([...titleMatches, ...keywordMatches]).size
      const relevant = score >= 5 && (strongMatches > 0 || (terms.length >= 3 && bodyMatches.length >= Math.min(3, terms.length)))
      return { document, score, relevant }
    })
    .filter((result) => result.relevant)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'vi'))
    .slice(0, Math.max(1, limit))
    .map((result) => result.document)
}
