import type { AssistantPorts } from '../domain/assistant.ports'
import {
  detectExactFactIntent,
  resolveBusinessFact,
  resolveProductFact,
  unavailableExactFact,
} from '../domain/exact-facts'
import { validateGroundedAnswer } from '../domain/grounding'
import { detectAssistantIntent, extractConversationConstraints, mergeConversationConstraints } from '../domain/intent'
import { retrieveKnowledge } from '../domain/retrieval'
import type {
  AssistantAnswer,
  AssistantAction,
  AssistantConversationConstraints,
  AssistantIntent,
  AssistantMessage,
  AssistantTrace,
} from '../domain/types'
import { recommendAudioSystem } from './recommend-audio-system'

export type AnswerAssistantContext = {
  constraints?: AssistantConversationConstraints
  includeTrace?: boolean
}

export function normalizeAssistantMessages(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value)) throw new Error('VALIDATION_ERROR')
  const userMessages: AssistantMessage[] = []

  for (const item of value) {
    const input = item && typeof item === 'object' ? item as Record<string, unknown> : {}
    if (input.role !== 'user' && input.role !== 'assistant') throw new Error('VALIDATION_ERROR')
    if (input.role === 'assistant') continue
    const content = String(input.content || '').trim().slice(0, 1000)
    if (!content) throw new Error('VALIDATION_ERROR')
    userMessages.push({ role: 'user', content })
  }

  const messages = userMessages.slice(-6)
  if (!messages.length) throw new Error('VALIDATION_ERROR')
  return messages
}

export function normalizeAssistantQuestion(value: unknown) {
  const content = String(value || '').trim().slice(0, 1000)
  if (!content) throw new Error('VALIDATION_ERROR')
  return content
}

function noKnowledgeAnswer(intent: AssistantIntent, constraints?: AssistantConversationConstraints): AssistantAnswer {
  return {
    answerKind: 'fallback',
    intent,
    answer: 'Tôi chưa tìm thấy thông tin đủ phù hợp trong dữ liệu công khai và kho tri thức đã được duyệt để trả lời chắc chắn. Bạn có thể cung cấp thêm nhu cầu, diện tích, ngân sách hoặc tên sản phẩm; nếu cần báo giá và tồn kho, vui lòng liên hệ trực tiếp với nhân viên tư vấn.',
    confidence: 0,
    sources: [],
    actions: [{ type: 'contact_form', label: 'Gửi yêu cầu tư vấn', href: '/contact' }],
    ...(constraints ? { constraints } : {}),
    needsHuman: true,
  }
}

function traceStage(trace: AssistantTrace, name: string, startedAt: number, outcome: string) {
  trace.stages.push({ name, latencyMs: Math.max(0, Math.round(performance.now() - startedAt)), outcome })
}

function withTrace(answer: AssistantAnswer, trace: AssistantTrace, includeTrace?: boolean) {
  return includeTrace ? { ...answer, trace } : answer
}

function sourceActions(sources: AssistantAnswer['sources']): AssistantAction[] {
  const actions: AssistantAction[] = []
  for (const source of sources) {
    if (!source.url?.startsWith('/')) continue
    if (source.type === 'product') actions.push({ type: 'product', label: `Xem ${source.title}`, href: source.url })
    if (source.type === 'article') actions.push({ type: 'article', label: `Đọc ${source.title}`, href: source.url })
    if (actions.length >= 3) break
  }
  return actions
}

export async function answerAssistant(
  messages: AssistantMessage[],
  ports: AssistantPorts,
  runtime: AnswerAssistantContext = {},
): Promise<AssistantAnswer> {
  const question = messages[messages.length - 1].content
  const constraints = messages
    .filter((message) => message.role === 'user')
    .reduce((current, message) => mergeConversationConstraints(current, extractConversationConstraints(message.content)), runtime.constraints || {})
  const trace: AssistantTrace = {
    stages: [],
    validator: { passed: true, violations: [] },
    graph: { enabled: ports.graphMode !== 'off', available: false, mode: ports.graphMode || 'off' },
  }
  const previousRecommendation = messages.slice(0, -1).reverse().find((message) => {
    if (message.role !== 'user') return false
    const intent = detectAssistantIntent(message.content)
    return intent === 'system_recommendation' || intent === 'product_recommendation'
  })

  let startedAt = performance.now()
  const exactIntent = ports.exactFactsEnabled ? detectExactFactIntent(question) : null
  traceStage(trace, 'intent', startedAt, exactIntent || detectAssistantIntent(question))

  if (exactIntent?.startsWith('business_')) {
    startedAt = performance.now()
    try {
      const answer = resolveBusinessFact(exactIntent, await ports.loadBusinessProfile()) || unavailableExactFact(exactIntent)
      traceStage(trace, 'exact_business', startedAt, answer.answerKind)
      return withTrace({ ...answer, constraints }, trace, runtime.includeTrace)
    } catch {
      traceStage(trace, 'exact_business', startedAt, 'unavailable')
      return withTrace({ ...unavailableExactFact(exactIntent), constraints }, trace, runtime.includeTrace)
    }
  }

  if (exactIntent?.startsWith('product_')) {
    startedAt = performance.now()
    try {
      const answer = resolveProductFact(exactIntent, question, await ports.listProducts())
      traceStage(trace, 'exact_product', startedAt, answer.answerKind)
      const shouldContinueConversation = answer.answerKind === 'clarification'
        && (exactIntent === 'product_specification' || Boolean(previousRecommendation))
      if (!shouldContinueConversation) {
        return withTrace({ ...answer, constraints }, trace, runtime.includeTrace)
      }
    } catch {
      traceStage(trace, 'exact_product', startedAt, 'unavailable')
      return withTrace({ ...unavailableExactFact(exactIntent), constraints }, trace, runtime.includeTrace)
    }
  }

  const currentIntent = detectAssistantIntent(question)
  const intent = previousRecommendation && currentIntent === 'knowledge_question' ? 'system_recommendation' : currentIntent
  if (intent === 'contact_conversion') {
    startedAt = performance.now()
    try {
      const contact = resolveBusinessFact('business_contact', await ports.loadBusinessProfile())
      traceStage(trace, 'contact_conversion', startedAt, contact ? 'resolved' : 'fallback')
      if (contact) return withTrace({ ...contact, intent, constraints, needsHuman: true }, trace, runtime.includeTrace)
    } catch {
      traceStage(trace, 'contact_conversion', startedAt, 'unavailable')
    }
    return withTrace(noKnowledgeAnswer(intent, constraints), trace, runtime.includeTrace)
  }

  if (intent === 'system_recommendation' || intent === 'product_recommendation') {
    startedAt = performance.now()
    const answer = await recommendAudioSystem(constraints, ports)
    trace.graph.available = Boolean(answer.recommendations?.length && ports.graphMode !== 'off')
    traceStage(trace, 'advisor', startedAt, answer.answerKind)
    return withTrace({ ...answer, intent }, trace, runtime.includeTrace)
  }

  if (ports.knowledgeEnabled === false) return withTrace(noKnowledgeAnswer(intent, constraints), trace, runtime.includeTrace)

  startedAt = performance.now()
  const documents = retrieveKnowledge(question, await ports.listKnowledge(question), 5)
  traceStage(trace, 'retrieval', startedAt, documents.length ? `${documents.length}_sources` : 'no_evidence')
  if (!documents.length) return withTrace(noKnowledgeAnswer(intent, constraints), trace, runtime.includeTrace)

  const sources = documents.map(({ id, type, title, url, excerpt, authority, updatedAt }) => ({
    id, type, title, ...(url ? { url } : {}), ...(excerpt ? { excerpt } : {}), authority, ...(updatedAt ? { updatedAt } : {}),
  }))
  if (intent === 'article_discovery') {
    const articles = sources.filter((source) => source.type === 'article')
    const selected = articles.length ? articles : sources
    return withTrace({
      answerKind: 'exact', intent,
      answer: `Tôi tìm thấy ${selected.length} nội dung phù hợp trong kho đã xuất bản.`,
      confidence: 0.9,
      sources: selected,
      actions: sourceActions(selected),
      constraints,
      needsHuman: false,
    }, trace, runtime.includeTrace)
  }

  const context = documents.map((document, index) => `[${index + 1}] ${document.content}`).join('\n\n').slice(0, 24_000)
  startedAt = performance.now()
  let generatedAnswer = ''
  try {
    generatedAnswer = await ports.generateAnswer({ messages, context, intent })
    traceStage(trace, 'model', startedAt, 'completed')
  } catch (error) {
    traceStage(trace, 'model', startedAt, error instanceof Error ? error.message : 'failed')
    return withTrace({
      answerKind: 'fallback', intent,
      answer: 'Tôi đã tìm thấy tài liệu phù hợp nhưng chưa thể tổng hợp câu trả lời lúc này. Bạn có thể mở các nguồn bên dưới hoặc gửi yêu cầu để kỹ thuật viên hỗ trợ.',
      confidence: 0.4,
      sources,
      actions: [...sourceActions(sources), { type: 'contact_form' as const, label: 'Nhờ kỹ thuật viên hỗ trợ', href: '/contact' }],
      constraints,
      needsHuman: true,
    }, trace, runtime.includeTrace)
  }

  startedAt = performance.now()
  const validation = validateGroundedAnswer({ answer: generatedAnswer, evidence: documents })
  trace.validator = validation
  traceStage(trace, 'grounding_validator', startedAt, validation.passed ? 'passed' : validation.violations.join(','))
  if (!validation.passed) {
    return withTrace({
      answerKind: 'fallback', intent,
      answer: 'Tôi đã tìm thấy nguồn liên quan nhưng bản tổng hợp chưa vượt qua kiểm tra dữ kiện. Bạn hãy xem nguồn bên dưới hoặc liên hệ kỹ thuật viên để được xác nhận.',
      confidence: 0.2,
      sources,
      actions: [...sourceActions(sources), { type: 'contact_form' as const, label: 'Xác nhận với kỹ thuật viên', href: '/contact' }],
      constraints,
      needsHuman: true,
    }, trace, runtime.includeTrace)
  }

  const averageAuthority = documents.reduce((total, document) => total + document.authority, 0) / documents.length
  return withTrace({
    answerKind: 'generated',
    intent,
    answer: generatedAnswer,
    confidence: Math.min(0.95, Math.max(0.7, averageAuthority / 100)),
    sources,
    actions: sourceActions(sources),
    ...(intent === 'troubleshooting' ? { followUpQuestions: ['Hiện tượng xảy ra liên tục hay chỉ khi tăng âm lượng?', 'Thiết bị nào nóng, có mùi khét hoặc tự ngắt không?'] } : {}),
    constraints,
    needsHuman: false,
  }, trace, runtime.includeTrace)
}
