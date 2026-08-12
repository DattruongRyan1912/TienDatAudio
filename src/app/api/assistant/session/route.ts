import { NextResponse } from 'next/server'
import { deleteAssistantConversation } from '@/modules/assistant/infrastructure/assistant-operations-repository'
import { assistantSessionCookieName, readAssistantSessionToken, readCookieValue } from '@/modules/assistant/infrastructure/assistant-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
  const token = readAssistantSessionToken(readCookieValue(request, assistantSessionCookieName))
  if (token) {
    try {
      await deleteAssistantConversation(token.id)
    } catch (error) {
      console.warn('[assistant] session deletion failed', error instanceof Error ? error.message : 'unknown')
      return NextResponse.json(
        { success: false, code: 'SESSION_DELETE_FAILED', message: 'Chưa thể xóa dữ liệu hội thoại. Vui lòng thử lại.' },
        { status: 503 },
      )
    }
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set(assistantSessionCookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
