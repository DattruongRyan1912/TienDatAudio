import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import {
  deleteAssistantConversation,
  getAssistantConversation,
  listAssistantConversations,
} from '@/modules/assistant/infrastructure/assistant-operations-repository'

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : 'CONVERSATION_FAILED'
  return NextResponse.json({ success: false, code }, { status: code === 'MONGODB_REQUIRED' ? 503 : 500 })
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (id) {
      const data = await getAssistantConversation(id)
      return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
    }
    const data = await listAssistantConversations(Number(url.searchParams.get('page') || 1), Number(url.searchParams.get('limit') || 20))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const id = new URL(request.url).searchParams.get('id') || ''
    if (!id) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR' }, { status: 400 })
    const deleted = await deleteAssistantConversation(id)
    return NextResponse.json({ success: deleted, code: deleted ? undefined : 'NOT_FOUND' }, { status: deleted ? 200 : 404 })
  } catch (error) {
    return errorResponse(error)
  }
}
