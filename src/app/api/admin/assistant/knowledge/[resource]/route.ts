import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { createKnowledgeResource, listKnowledgeResources } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { invalidateAssistantKnowledgeCache } from '@/modules/assistant/infrastructure/knowledge-repository'
import { knowledgeErrorResponse, knowledgeMutationResponse, parseKnowledgeResource } from '@/modules/knowledge/presentation/knowledge-http'

type Context = { params: Promise<{ resource: string }> }

export async function GET(request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const resource = parseKnowledgeResource((await params).resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const url = new URL(request.url)
    const data = await listKnowledgeResources(resource, {
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
      type: url.searchParams.get('type') || undefined,
      page: Number(url.searchParams.get('page') || 1),
      limit: Number(url.searchParams.get('limit') || 50),
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  const resource = parseKnowledgeResource((await params).resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const result = await createKnowledgeResource(resource, await request.json(), session.username)
    if (result.ok) invalidateAssistantKnowledgeCache()
    return knowledgeMutationResponse(result)
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
