import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assistantGoldenDataset } from '../src/modules/assistant/domain/golden-dataset'
import { validateGroundedAnswer } from '../src/modules/assistant/domain/grounding'
import { detectAssistantIntent, extractConversationConstraints, mergeConversationConstraints } from '../src/modules/assistant/domain/intent'
import { recommendAudioSystem } from '../src/modules/assistant/application/recommend-audio-system'
import type { AssistantPorts } from '../src/modules/assistant/domain/assistant.ports'
import type { AssistantConversationConstraints, AssistantKnowledgeDocument, AssistantProductFact } from '../src/modules/assistant/domain/types'
import { chunkMarkdown } from '../src/modules/knowledge/domain/chunking'
import { validateKnowledgeClaim, validateKnowledgeEntry } from '../src/modules/knowledge/domain/validation'
import type { CompatibilityAssessment } from '../src/modules/knowledge/domain/types'
import { assistantRetentionDays, createAssistantSessionToken, readAssistantSessionToken } from '../src/modules/assistant/infrastructure/assistant-session'
import { redactAssistantText } from '../src/modules/assistant/infrastructure/assistant-operations-repository'

const product: AssistantProductFact = {
  id: 'speaker-1', name: 'Loa kiểm thử', slug: 'loa-kiem-thu', brand: 'Test', category: 'Loa',
  price: 20_000_000, salePrice: null, inStock: true, specifications: {},
}

const compatibility: CompatibilityAssessment = {
  id: 'compat-1', componentIds: [product.id], room: { minM2: 15, maxM2: 30 }, useCases: ['music'], preferences: [],
  verdict: 'recommended', reason: 'Đã đo và nghe thử trong phòng tương đương.', sourceIds: ['source-1'], reviewStatus: 'verified',
  confidence: 0.95, verifiedBy: 'admin', verifiedAt: '2026-08-12T00:00:00.000Z', version: 1,
  createdAt: '2026-08-12T00:00:00.000Z', updatedAt: '2026-08-12T00:00:00.000Z',
}

function advisorPorts(graphMode: 'off' | 'shadow' | 'public'): AssistantPorts {
  return {
    exactFactsEnabled: true, knowledgeEnabled: true, advisorEnabled: true, graphMode,
    loadBusinessProfile: async () => ({ businessHours: [] }), listProducts: async () => [product], listKnowledge: async () => [],
    listVerifiedCompatibility: async () => [compatibility], queryGraphRecommendations: async () => [{ assessmentId: compatibility.id, productIds: [product.id], sourceIds: compatibility.sourceIds, path: ['compatibility', 'product'], score: 1 }],
    generateAnswer: async () => 'Không được gọi',
  }
}

test('assistant intent and constraints support troubleshooting and multi-turn advisor context', () => {
  assert.equal(detectAssistantIntent('Loa karaoke bị hú rít phải làm sao?'), 'troubleshooting')
  assert.equal(detectAssistantIntent('Tư vấn dàn nghe nhạc cho phòng khách'), 'system_recommendation')
  const first = extractConversationConstraints('Phòng 22m², nghe nhạc')
  const second = extractConversationConstraints('Ngân sách dưới 40 triệu')
  assert.deepEqual(mergeConversationConstraints(first, second), { roomSizeM2: 22, useCases: ['music'], budgetMax: 40_000_000 })
})

test('advisor asks mandatory questions before making recommendations', async () => {
  const result = await recommendAudioSystem({ useCases: ['music'] }, advisorPorts('off'))
  assert.equal(result.answerKind, 'clarification')
  assert.match(result.answer, /không gian|m²/i)
  assert.match(result.answer, /ngân sách/i)
  assert.equal(result.recommendations, undefined)
})

test('graph shadow never changes public recommendation score while graph public may score', async () => {
  const constraints: AssistantConversationConstraints = { roomSizeM2: 20, budgetMax: 30_000_000, useCases: ['music'] }
  const shadow = await recommendAudioSystem(constraints, advisorPorts('shadow'))
  const publicGraph = await recommendAudioSystem(constraints, advisorPorts('public'))
  assert.equal(shadow.recommendations?.[0]?.score, 0.85)
  assert.equal(publicGraph.recommendations?.[0]?.score, 1)
})

test('grounding validator blocks unsupported numbers, model URLs and unknown products', () => {
  const evidence: AssistantKnowledgeDocument[] = [{ id: 'doc-1', type: 'knowledge', title: 'Nguồn', authority: 90, content: 'Công suất 1000 W.', titleTerms: '', keywordTerms: '', bodyTerms: '' }]
  assert.deepEqual(validateGroundedAnswer({ answer: 'Công suất là 1000 W [1].', evidence }).violations, [])
  const invalid = validateGroundedAnswer({
    answer: 'Công suất 2500 W tại https://example.com [1].', evidence, products: [product],
    recommendations: [{ productId: 'unknown', name: 'Bịa', url: '/x', price: null, inStock: null, score: 1, reasons: [] }],
  })
  assert.equal(invalid.passed, false)
  assert.ok(invalid.violations.some((value) => value.startsWith('UNSUPPORTED_NUMBER')))
  assert.ok(invalid.violations.includes('MODEL_URL_NOT_ALLOWED'))
  assert.ok(invalid.violations.includes('UNKNOWN_RECOMMENDATION:unknown'))
})

test('knowledge validation keeps publish and evidence gates closed', () => {
  const entry = validateKnowledgeEntry({ title: 'Chính sách thử', answerMarkdown: 'Nội dung có thể kiểm chứng.', reviewStatus: 'published', reviewedBy: 'admin', sourceIds: [] })
  assert.ok(entry.errors.some((value) => value.includes('nguồn')))
  const claim = validateKnowledgeClaim({
    subject: { type: 'product', sourceId: 'p1', label: 'Loa A' }, predicate: 'compatible_with',
    object: { type: 'product', sourceId: 'p2', label: 'Amply B' }, reason: 'Đã thử nghiệm.', reviewStatus: 'verified', verifiedBy: 'admin', sourceIds: [],
  })
  assert.ok(claim.errors.some((value) => value.includes('nguồn')))
})

test('markdown chunking is deterministic and preserves heading context', () => {
  const markdown = '# Hướng dẫn\n\nMở đầu.\n\n## Căn chỉnh\n\nGiảm gain micro và kiểm tra vị trí loa.'
  const first = chunkMarkdown(markdown, 800)
  const second = chunkMarkdown(markdown, 800)
  assert.deepEqual(first, second)
  assert.deepEqual(first[1]?.headingPath, ['Hướng dẫn', 'Căn chỉnh'])
  assert.match(first[1]?.normalizedText || '', /giam gain micro/)
})

test('assistant session token is signed and rejects tampering', () => {
  const previous = process.env.ASSISTANT_SESSION_SECRET
  try {
    process.env.ASSISTANT_SESSION_SECRET = 'test-secret-that-is-long-enough-for-signing'
    const token = createAssistantSessionToken('session-1')
    assert.equal(readAssistantSessionToken(token)?.id, 'session-1')
    assert.equal(readAssistantSessionToken(`${token.slice(0, -1)}x`), null)
  } finally {
    if (previous === undefined) delete process.env.ASSISTANT_SESSION_SECRET
    else process.env.ASSISTANT_SESSION_SECRET = previous
  }
})

test('assistant privacy controls clamp retention and redact contact data', () => {
  const previous = process.env.ASSISTANT_RETENTION_DAYS
  try {
    process.env.ASSISTANT_RETENTION_DAYS = '999'
    assert.equal(assistantRetentionDays(), 90)
    process.env.ASSISTANT_RETENTION_DAYS = '0'
    assert.equal(assistantRetentionDays(), 1)
    assert.equal(redactAssistantText('Liên hệ 0934 995 657 hoặc user@example.com'), 'Liên hệ [số điện thoại đã ẩn] hoặc [email đã ẩn]')
  } finally {
    if (previous === undefined) delete process.env.ASSISTANT_RETENTION_DAYS
    else process.env.ASSISTANT_RETENTION_DAYS = previous
  }
})

test('golden dataset contains exactly 120 unique auditable cases', () => {
  assert.equal(assistantGoldenDataset.length, 120)
  assert.equal(new Set(assistantGoldenDataset.map((item) => item.id)).size, 120)
  assert.ok(assistantGoldenDataset.every((item) => item.messages.length > 0))
})
