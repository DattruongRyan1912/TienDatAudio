import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { extractKnowledgeClaimSuggestions } from '@/modules/knowledge/application/extract-knowledge-suggestions'
import { knowledgeErrorResponse } from '@/modules/knowledge/presentation/knowledge-http'

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const raw = await request.text()
    if (raw.length > 30_000) return NextResponse.json({ success: false, code: 'PAYLOAD_TOO_LARGE' }, { status: 413 })
    const body = JSON.parse(raw) as { text?: unknown; sourceIds?: unknown }
    const data = await extractKnowledgeClaimSuggestions({
      text: String(body.text || ''),
      sourceIds: Array.isArray(body.sourceIds) ? body.sourceIds.map(String) : [],
      actor: session.username,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR' }, { status: 400 })
    return knowledgeErrorResponse(error)
  }
}
