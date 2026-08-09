import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildKeywordDraft, deriveContentSEOInsights, getContentChecklist } from '../src/lib/content-seo'
import { normalizeContentPost } from '../src/lib/content-validation'
import { normalizeSEOConfig } from '../src/lib/seo-strategy'

const config = normalizeSEOConfig({ keywords: [
  { id: 'covered', term: 'loa nghe nhạc', targetPage: '/kien-thuc', cluster: 'audio', isActive: true },
  { id: 'uncovered', term: 'lắp đặt âm thanh', targetPage: '/contact', cluster: 'service', isActive: true },
] })
const post = normalizeContentPost({ id: 'published-1', title: 'Bài loa nghe nhạc', slug: 'bai-loa', excerpt: 'Mô tả đủ dài để bài viết được kiểm thử coverage.', bodyMarkdown: '## Hướng dẫn\n\nNội dung', status: 'published', publishedAt: '2026-01-01T00:00:00.000Z', keywordIds: ['covered'], relatedPostIds: [] })

test('content insights identify uncovered keywords', () => {
  const insights = deriveContentSEOInsights(config, [post])
  assert.deepEqual(insights.uncoveredKeywords.map((item) => item.keyword.id), ['uncovered'])
  assert.equal(insights.coverage.find((item) => item.keyword.id === 'covered')?.state, 'published')
})

test('keyword brief creates a draft and never publishes it', () => {
  const keyword = config.keywords.find((item) => item.id === 'uncovered')!
  const draft = buildKeywordDraft({ ...keyword, notes: 'Góc nhìn có thể kiểm chứng.' })
  assert.equal(draft.status, 'draft')
  assert.equal(draft.primaryKeywordId, 'uncovered')
  assert.match(draft.bodyMarkdown, /Góc nhìn có thể kiểm chứng/)
})

test('editorial checklist is boolean evidence, not a score', () => {
  const checklist = getContentChecklist(post, config.keywords[0])
  assert.ok(checklist.some((item) => item.id === 'title'))
  assert.equal('score' in checklist, false)
})
