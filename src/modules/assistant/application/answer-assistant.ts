import { retrieveKnowledge } from '../domain/retrieval'
import type { AssistantAnswer, AssistantMessage } from '../domain/types'
import { createDeepSeekAnswer } from '../infrastructure/deepseek-client'
import { listAssistantKnowledge } from '../infrastructure/knowledge-repository'

export function normalizeAssistantMessages(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value)) throw new Error('VALIDATION_ERROR')
  const messages = value.slice(-6).map((item) => {
    const input = item && typeof item === 'object' ? item as Record<string, unknown> : {}
    const role: AssistantMessage['role'] | null = input.role === 'assistant' ? 'assistant' : input.role === 'user' ? 'user' : null
    const content = String(input.content || '').trim().slice(0, 1000)
    if (!role || !content) throw new Error('VALIDATION_ERROR')
    return { role, content }
  })
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new Error('VALIDATION_ERROR')
  return messages
}

export async function answerAssistant(messages: AssistantMessage[]): Promise<AssistantAnswer> {
  const question = messages[messages.length - 1].content
  const documents = retrieveKnowledge(question, await listAssistantKnowledge(), 5)
  if (!documents.length) {
    return {
      answer: 'Tôi chưa tìm thấy thông tin đủ phù hợp trong dữ liệu công khai của Tiến Đạt Audio để trả lời chắc chắn. Bạn có thể cung cấp thêm nhu cầu, diện tích, ngân sách hoặc tên sản phẩm; nếu cần báo giá và tồn kho, vui lòng liên hệ trực tiếp với nhân viên tư vấn.',
      sources: [],
    }
  }
  const context = documents.map((document, index) => `[${index + 1}] ${document.content}`).join('\n\n').slice(0, 24_000)
  const generatedAnswer = await createDeepSeekAnswer({ messages, context })
  const validCitation = documents.some((_, index) => generatedAnswer.includes(`[${index + 1}]`))
  const answer = validCitation
    ? generatedAnswer
    : `Tôi đã tìm thấy ${documents.length} nguồn có thể liên quan nhưng chưa đủ căn cứ để tổng hợp một câu trả lời chắc chắn. Bạn hãy xem các nguồn bên dưới hoặc liên hệ nhân viên Tiến Đạt Audio để được tư vấn chính xác.`
  return {
    answer,
    sources: documents.map(({ id, type, title, url, excerpt }) => ({ id, type, title, url, excerpt })),
  }
}
