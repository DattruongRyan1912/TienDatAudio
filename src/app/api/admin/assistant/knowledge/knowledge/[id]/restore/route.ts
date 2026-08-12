import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { restoreKnowledgeRevision } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { invalidateAssistantKnowledgeCache } from '@/modules/assistant/infrastructure/knowledge-repository'
import { knowledgeErrorResponse, knowledgeMutationResponse } from '@/modules/knowledge/presentation/knowledge-http'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { revisionId?: string; version?: number }
    if (!body.revisionId || !Number.isInteger(Number(body.version))) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR' }, { status: 400 })
    const result = await restoreKnowledgeRevision((await params).id, body.revisionId, Number(body.version), session.username)
    if (result.ok) invalidateAssistantKnowledgeCache()
    return knowledgeMutationResponse(result)
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
