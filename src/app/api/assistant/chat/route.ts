import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { answerAssistant, normalizeAssistantMessages, normalizeAssistantQuestion } from '@/modules/assistant/application/answer-assistant'
import type { AssistantMessage } from '@/modules/assistant/domain/types'
import {
  assistantConversationsEnabled,
  assistantPublicEnabled,
} from '@/modules/assistant/infrastructure/assistant-config'
import { createAssistantPorts } from '@/modules/assistant/infrastructure/assistant-runtime'
import { consumeAssistantRateLimit } from '@/modules/assistant/infrastructure/rate-limit'
import {
  getOrCreateAssistantSession,
  loadAssistantHistory,
  recordAssistantExchange,
  updateAssistantSessionConstraints,
} from '@/modules/assistant/infrastructure/assistant-operations-repository'
import {
  assistantSessionCookieName,
  assistantRetentionDays,
  createAssistantSessionToken,
  readAssistantSessionToken,
  readCookieValue,
} from '@/modules/assistant/infrastructure/assistant-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clientKey(request: Request) {
  const value = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  return createHash('sha256').update(value.trim()).digest('hex')
}

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : 'ASSISTANT_FAILED'
  if (code === 'VALIDATION_ERROR' || error instanceof SyntaxError) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Tin nhắn không hợp lệ.' }, { status: 400 })
  if (code === 'ASSISTANT_DISABLED') return NextResponse.json({ success: false, code, message: 'Trợ lý hiện chưa được bật.' }, { status: 503 })
  console.error('[assistant] request failed', code)
  return NextResponse.json({ success: false, code: 'ASSISTANT_FAILED', message: 'Chưa thể trả lời lúc này.' }, { status: 500 })
}

function latestQuestion(body: { message?: unknown; messages?: unknown }) {
  if (body.message !== undefined) return normalizeAssistantQuestion(body.message)
  const messages = normalizeAssistantMessages(body.messages)
  return messages[messages.length - 1].content
}

export async function POST(request: Request) {
  if (!assistantPublicEnabled()) return errorResponse(new Error('ASSISTANT_DISABLED'))
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 12_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Nội dung quá dài.' }, { status: 413 })

  const rate = consumeAssistantRateLimit(clientKey(request))
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, code: 'RATE_LIMITED', message: 'Bạn đã gửi quá nhiều câu hỏi. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    )
  }

  const requestId = randomUUID()
  const startedAt = performance.now()
  let session: Awaited<ReturnType<typeof getOrCreateAssistantSession>> | null = null
  try {
    const rawBody = await request.text()
    if (rawBody.length > 12_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Nội dung quá dài.' }, { status: 413 })
    const body = JSON.parse(rawBody) as { message?: unknown; messages?: unknown }
    const question = latestQuestion(body)

    let messages: AssistantMessage[] = [{ role: 'user', content: question }]
    if (assistantConversationsEnabled()) {
      try {
        const token = readAssistantSessionToken(readCookieValue(request, assistantSessionCookieName))
        session = await getOrCreateAssistantSession(token?.id)
        messages = [...await loadAssistantHistory(session.id, 8), { role: 'user' as const, content: question }].slice(-10)
      } catch (error) {
        console.warn('[assistant] conversation persistence degraded', error instanceof Error ? error.message : 'unknown')
      }
    }

    const answer = await answerAssistant(messages, createAssistantPorts(), { constraints: session?.constraints, includeTrace: true })
    const { trace, ...publicAnswer } = answer
    const latencyMs = Math.round(performance.now() - startedAt)

    if (session) {
      try {
        if (answer.constraints) await updateAssistantSessionConstraints(session.id, answer.constraints)
        await recordAssistantExchange({
          sessionId: session.id,
          requestId,
          question,
          answer: answer.answer,
          intent: answer.intent,
          answerKind: answer.answerKind,
          sourceIds: answer.sources.map((source) => source.id),
          confidence: answer.confidence,
          needsHuman: answer.needsHuman,
          latencyMs,
          modelLatencyMs: trace?.stages.find((stage) => stage.name === 'model')?.latencyMs || 0,
          graphLatencyMs: trace?.stages.find((stage) => stage.name === 'advisor')?.latencyMs || 0,
          validatorOutcome: trace?.validator.passed ? 'passed' : 'failed',
        })
      } catch (error) {
        console.warn('[assistant] telemetry persistence degraded', error instanceof Error ? error.message : 'unknown')
      }
    }

    const response = NextResponse.json({ success: true, data: { requestId, ...publicAnswer } })
    response.headers.set('Cache-Control', 'no-store')
    if (session) {
      response.cookies.set(assistantSessionCookieName, createAssistantSessionToken(session.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: assistantRetentionDays() * 86_400,
      })
    }
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
