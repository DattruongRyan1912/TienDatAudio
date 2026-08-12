import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { archiveKnowledgeResource, getKnowledgeResource, updateKnowledgeResource } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { invalidateAssistantKnowledgeCache } from '@/modules/assistant/infrastructure/knowledge-repository'
import { knowledgeErrorResponse, knowledgeMutationResponse, parseKnowledgeResource } from '@/modules/knowledge/presentation/knowledge-http'

type Context = { params: Promise<{ resource: string; id: string }> }

export async function GET(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const values = await params
  const resource = parseKnowledgeResource(values.resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const data = await getKnowledgeResource(resource, values.id)
    return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  const values = await params
  const resource = parseKnowledgeResource(values.resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const body = await request.json() as Record<string, unknown>
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Thiếu version hợp lệ.' }, { status: 400 })
    const result = await updateKnowledgeResource(resource, values.id, body, version, session.username)
    if (result.ok) invalidateAssistantKnowledgeCache()
    return knowledgeMutationResponse(result)
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  const values = await params
  const resource = parseKnowledgeResource(values.resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const body = await request.json() as { version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Thiếu version hợp lệ.' }, { status: 400 })
    const result = await archiveKnowledgeResource(resource, values.id, version, session.username)
    if (result.ok) invalidateAssistantKnowledgeCache()
    return knowledgeMutationResponse(result)
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
