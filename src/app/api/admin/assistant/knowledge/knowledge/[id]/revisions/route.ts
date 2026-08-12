import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { listKnowledgeRevisions } from '@/modules/knowledge/infrastructure/knowledge-repository'
import { knowledgeErrorResponse } from '@/modules/knowledge/presentation/knowledge-http'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    return NextResponse.json({ success: true, data: await listKnowledgeRevisions((await params).id) })
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
