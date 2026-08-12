import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { answerAssistant, normalizeAssistantQuestion } from '@/modules/assistant/application/answer-assistant'
import { createAssistantPorts } from '@/modules/assistant/infrastructure/assistant-runtime'
import type { AssistantConversationConstraints } from '@/modules/assistant/domain/types'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { message?: unknown; constraints?: AssistantConversationConstraints }
    const message = normalizeAssistantQuestion(body.message)
    const data = await answerAssistant([{ role: 'user', content: message }], createAssistantPorts(), { constraints: body.constraints, includeTrace: true })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ASSISTANT_TEST_FAILED'
    return NextResponse.json({ success: false, code, message: code === 'VALIDATION_ERROR' ? 'Câu hỏi không hợp lệ.' : 'Không thể chạy test.' }, { status: code === 'VALIDATION_ERROR' ? 400 : 500 })
  }
}
