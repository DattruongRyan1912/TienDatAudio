import { randomUUID } from 'node:crypto'
import type { AssistantEvaluationResult } from '@/modules/knowledge/domain/types'
import type { CompatibilityAssessment } from '@/modules/knowledge/domain/types'
import { ASSISTANT_DATASET_VERSION, assistantGoldenDataset, type AssistantGoldenCase } from '../domain/golden-dataset'
import type { AssistantPorts } from '../domain/assistant.ports'
import type { AssistantBusinessProfile, AssistantKnowledgeDocument, AssistantProductFact } from '../domain/types'
import { normalizeSearchText } from '../domain/retrieval'
import { answerAssistant } from './answer-assistant'

type EvaluationMode = 'deterministic' | 'full'

function replacePlaceholders(value: string, productName: string) {
  return value.replaceAll('{{FIRST_PRODUCT}}', productName || 'sản phẩm chưa xác định')
}

const evaluationProfile: AssistantBusinessProfile = {
  name: 'Tiến Đạt Audio',
  alternateName: 'Audio Archive',
  description: 'Đơn vị tư vấn và cung cấp giải pháp âm thanh.',
  phone: '090 111 22 33',
  email: 'evaluation@example.com',
  address: '123 Đường Kiểm Thử, Quảng Ngãi',
  businessHours: ['Thứ Hai – Chủ Nhật: 08:00–20:00'],
  mapUrl: 'https://www.google.com/maps',
  updatedAt: '2026-08-12T00:00:00.000Z',
}

const evaluationProduct: AssistantProductFact = {
  id: 'evaluation-product',
  name: 'Sonic Reference XR100',
  slug: 'sonic-reference-xr100',
  brand: 'Sonic',
  category: 'Loa',
  price: 20_000_000,
  salePrice: null,
  inStock: true,
  specifications: { 'Công suất RMS': '500 W', 'Kích thước': '500 × 300 × 280 mm', 'Trọng lượng': '18 kg' },
  description: 'Sản phẩm fixture chỉ dùng trong evaluation deterministic.',
  updatedAt: '2026-08-12T00:00:00.000Z',
}

const evaluationCompatibility: CompatibilityAssessment = {
  id: 'evaluation-compatibility',
  componentIds: [evaluationProduct.id],
  room: { minM2: 1, maxM2: 500 },
  useCases: ['music', 'karaoke', 'cinema', 'event'],
  preferences: [],
  verdict: 'recommended',
  reason: 'Fixture đã được xác minh để kiểm tra luồng recommendation, không phải dữ liệu public.',
  sourceIds: ['evaluation-source'],
  reviewStatus: 'verified',
  confidence: 1,
  verifiedBy: 'evaluation-runner',
  verifiedAt: '2026-08-12T00:00:00.000Z',
  version: 1,
  createdAt: '2026-08-12T00:00:00.000Z',
  updatedAt: '2026-08-12T00:00:00.000Z',
}

function evaluationKnowledge(query: string): AssistantKnowledgeDocument[] {
  const normalized = normalizeSearchText(query)
  return [{
    id: `evaluation-knowledge-${Buffer.from(normalized).toString('base64url').slice(0, 24)}`,
    type: 'knowledge',
    title: `Nguồn kiểm thử: ${query}`,
    excerpt: 'Nguồn fixture đã duyệt cho evaluation deterministic.',
    authority: 90,
    updatedAt: '2026-08-12T00:00:00.000Z',
    content: `Tài liệu đã duyệt cho câu hỏi: ${query}`,
    titleTerms: normalized,
    keywordTerms: normalized,
    bodyTerms: normalized,
    reviewStatus: 'published',
  }]
}

function deterministicPorts(base: AssistantPorts): AssistantPorts {
  return {
    ...base,
    exactFactsEnabled: true,
    knowledgeEnabled: true,
    advisorEnabled: true,
    graphMode: 'shadow',
    loadBusinessProfile: async () => evaluationProfile,
    listProducts: async () => [evaluationProduct],
    listKnowledge: async (query) => evaluationKnowledge(query || ''),
    listVerifiedCompatibility: async () => [evaluationCompatibility],
    queryGraphRecommendations: async () => [{
      assessmentId: evaluationCompatibility.id,
      productIds: [evaluationProduct.id],
      sourceIds: evaluationCompatibility.sourceIds,
      path: ['CompatibilityAssessment', 'Product'],
      score: 1,
    }],
    generateAnswer: async () => 'Nội dung được tổng hợp từ nguồn đã duyệt [1].',
  }
}

function scenarioPorts(base: AssistantPorts, testCase: AssistantGoldenCase, mode: EvaluationMode): AssistantPorts {
  const ports: AssistantPorts = mode === 'full' ? { ...base } : deterministicPorts(base)
  if (testCase.scenario === 'mongo_unavailable') {
    ports.loadBusinessProfile = async () => { throw new Error('ASSISTANT_LIVE_DATA_UNAVAILABLE') }
    ports.listProducts = async () => { throw new Error('ASSISTANT_LIVE_DATA_UNAVAILABLE') }
  }
  if (testCase.scenario === 'model_unavailable') ports.generateAnswer = async () => { throw new Error('DEEPSEEK_UNAVAILABLE') }
  if (testCase.scenario === 'graph_unavailable') ports.queryGraphRecommendations = async () => { throw new Error('NEO4J_UNAVAILABLE') }
  if (testCase.scenario === 'no_evidence') ports.listKnowledge = async () => []
  return ports
}

function evaluateCase(testCase: AssistantGoldenCase, answer: Awaited<ReturnType<typeof answerAssistant>>) {
  const violations: string[] = []
  if (answer.intent !== testCase.expectedIntent) violations.push(`INTENT:${answer.intent}`)
  if (testCase.expectedAnswerKinds?.length && !testCase.expectedAnswerKinds.includes(answer.answerKind)) violations.push(`ANSWER_KIND:${answer.answerKind}`)
  if (testCase.expectedSourceTypes?.length && !answer.sources.some((source) => testCase.expectedSourceTypes!.includes(source.type))) violations.push('SOURCE_TYPE')
  const normalizedAnswer = answer.answer.toLocaleLowerCase('vi')
  for (const required of testCase.requiredText || []) if (!normalizedAnswer.includes(required.toLocaleLowerCase('vi'))) violations.push(`MISSING:${required}`)
  for (const forbidden of testCase.forbiddenText || []) if (normalizedAnswer.includes(forbidden.toLocaleLowerCase('vi'))) violations.push(`FORBIDDEN:${forbidden}`)
  const modelCalled = Boolean(answer.trace?.stages.some((stage) => stage.name === 'model'))
  if (!testCase.modelAllowed && modelCalled) violations.push('MODEL_MUST_BYPASS')
  if (!answer.trace?.validator.passed) violations.push(...(answer.trace?.validator.violations || ['GROUNDING_FAILED']))
  return violations
}

export async function runAssistantEvaluations(input: {
  ports: AssistantPorts
  mode?: EvaluationMode
  limit?: number
  group?: AssistantGoldenCase['group']
}) {
  const mode = input.mode || 'deterministic'
  const productName = input.mode === 'full'
    ? (await input.ports.listProducts().catch(() => []))[0]?.name || ''
    : evaluationProduct.name
  const selected = assistantGoldenDataset
    .filter((testCase) => !input.group || testCase.group === input.group)
    .slice(0, Math.min(mode === 'full' ? 20 : 120, Math.max(1, input.limit || (mode === 'full' ? 10 : 120))))
  const runId = randomUUID()
  const results: AssistantEvaluationResult[] = []
  for (const testCase of selected) {
    const messages = testCase.messages.map((message) => ({ ...message, content: replacePlaceholders(message.content, productName) }))
    const startedAt = performance.now()
    try {
      const answer = await answerAssistant(messages, scenarioPorts(input.ports, testCase, mode), { includeTrace: true })
      const violations = evaluateCase(testCase, answer)
      results.push({
        id: randomUUID(), runId, caseId: testCase.id, datasetVersion: ASSISTANT_DATASET_VERSION,
        expectedIntent: testCase.expectedIntent, actualIntent: answer.intent, passed: violations.length === 0,
        violations, latencyMs: Math.round(performance.now() - startedAt), sourceIds: answer.sources.map((source) => source.id),
        answerKind: answer.answerKind, createdAt: new Date().toISOString(),
      })
    } catch (error) {
      results.push({
        id: randomUUID(), runId, caseId: testCase.id, datasetVersion: ASSISTANT_DATASET_VERSION,
        expectedIntent: testCase.expectedIntent, actualIntent: 'error', passed: false,
        violations: [error instanceof Error ? error.message : 'EVALUATION_FAILED'], latencyMs: Math.round(performance.now() - startedAt),
        sourceIds: [], answerKind: 'error', createdAt: new Date().toISOString(),
      })
    }
  }
  const passed = results.filter((result) => result.passed).length
  return {
    runId,
    datasetVersion: ASSISTANT_DATASET_VERSION,
    mode,
    summary: { total: results.length, passed, failed: results.length - passed, passRate: results.length ? passed / results.length : 0 },
    results,
  }
}
