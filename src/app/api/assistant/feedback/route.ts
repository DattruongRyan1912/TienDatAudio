import { NextResponse } from 'next/server'
import { saveAssistantFeedback } from '@/modules/assistant/infrastructure/assistant-operations-repository'
import { assistantSessionCookieName, readAssistantSessionToken, readCookieValue } from '@/modules/assistant/infrastructure/assistant-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    if (rawBody.length > 2_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Nội dung quá dài.' }, { status: 413 })
    const body = JSON.parse(rawBody) as { requestId?: unknown; helpful?: unknown; reason?: unknown }
    const token = readAssistantSessionToken(readCookieValue(request, assistantSessionCookieName))
    if (!token) return NextResponse.json({ success: false, code: 'SESSION_REQUIRED', message: 'Phiên trợ lý đã hết hạn.' }, { status: 401 })
    const requestId = String(body.requestId || '').trim().slice(0, 100)
    if (!requestId || typeof body.helpful !== 'boolean') return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Feedback không hợp lệ.' }, { status: 400 })
    const feedback = await saveAssistantFeedback(token.id, requestId, body.helpful, String(body.reason || '').slice(0, 500))
    return NextResponse.json({ success: true, data: { requestId: feedback.requestId, helpful: feedback.helpful } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'FEEDBACK_FAILED'
    if (code === 'FEEDBACK_REQUEST_NOT_FOUND') return NextResponse.json({ success: false, code, message: 'Không tìm thấy câu trả lời trong phiên hiện tại.' }, { status: 404 })
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Feedback không hợp lệ.' }, { status: 400 })
    console.error('[assistant-feedback]', code)
    return NextResponse.json({ success: false, code: 'FEEDBACK_FAILED', message: 'Chưa thể lưu feedback.' }, { status: 500 })
  }
}
