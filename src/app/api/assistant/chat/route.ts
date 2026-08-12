import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { answerAssistant, normalizeAssistantMessages } from '@/modules/assistant/application/answer-assistant'
import { hasDeepSeekConfig } from '@/modules/assistant/infrastructure/deepseek-client'
import { consumeAssistantRateLimit } from '@/modules/assistant/infrastructure/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clientKey(request: Request) {
  const value = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  return createHash('sha256').update(value.trim()).digest('hex')
}

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : 'ASSISTANT_FAILED'
  const timedOut = error instanceof Error && error.name === 'TimeoutError'
  if (code === 'VALIDATION_ERROR' || error instanceof SyntaxError) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Tin nhắn không hợp lệ.' }, { status: 400 })
  if (code === 'DEEPSEEK_REQUIRED') return NextResponse.json({ success: false, code, message: 'Trợ lý chưa được cấu hình.' }, { status: 503 })
  if (code === 'DEEPSEEK_AUTH_FAILED') return NextResponse.json({ success: false, code, message: 'Trợ lý đang được bảo trì.' }, { status: 503 })
  if (code === 'DEEPSEEK_BALANCE_REQUIRED') return NextResponse.json({ success: false, code, message: 'Trợ lý đang tạm ngưng.' }, { status: 503 })
  if (code === 'DEEPSEEK_RATE_LIMITED') return NextResponse.json({ success: false, code, message: 'Trợ lý đang bận, vui lòng thử lại sau.' }, { status: 429 })
  if (code === 'DEEPSEEK_UNAVAILABLE' || code === 'DEEPSEEK_EMPTY_RESPONSE' || code === 'DEEPSEEK_REQUEST_FAILED' || timedOut) {
    return NextResponse.json({ success: false, code: 'ASSISTANT_UNAVAILABLE', message: 'Chưa thể trả lời lúc này, vui lòng thử lại sau.' }, { status: 503 })
  }
  console.error('[assistant] request failed', error instanceof Error ? error.message : 'unknown')
  return NextResponse.json({ success: false, code: 'ASSISTANT_FAILED', message: 'Chưa thể trả lời lúc này.' }, { status: 500 })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 12_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Nội dung quá dài.' }, { status: 413 })

  const rate = consumeAssistantRateLimit(clientKey(request))
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, code: 'RATE_LIMITED', message: 'Bạn đã gửi quá nhiều câu hỏi. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    )
  }
  if (!hasDeepSeekConfig()) return errorResponse(new Error('DEEPSEEK_REQUIRED'))

  try {
    const rawBody = await request.text()
    if (rawBody.length > 12_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Nội dung quá dài.' }, { status: 413 })
    const body = JSON.parse(rawBody) as { messages?: unknown }
    return NextResponse.json({ success: true, data: await answerAssistant(normalizeAssistantMessages(body.messages)) })
  } catch (error) {
    return errorResponse(error)
  }
}
