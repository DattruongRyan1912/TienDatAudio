import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import {
  archiveKnowledgeResource,
  publishKnowledgeEntry,
  submitKnowledgeForReview,
  updateEvidenceReviewStatus,
} from '@/modules/knowledge/infrastructure/knowledge-repository'
import { invalidateAssistantKnowledgeCache } from '@/modules/assistant/infrastructure/knowledge-repository'
import { knowledgeErrorResponse, knowledgeMutationResponse, parseKnowledgeResource } from '@/modules/knowledge/presentation/knowledge-http'
import type { EvidenceReviewStatus } from '@/modules/knowledge/domain/types'

type Context = { params: Promise<{ resource: string; id: string }> }

export async function POST(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  const values = await params
  const resource = parseKnowledgeResource(values.resource)
  if (!resource) return NextResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 })
  try {
    const body = await request.json() as { action?: string; version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Thiếu version hợp lệ.' }, { status: 400 })

    let result
    if (resource === 'knowledge') {
      if (body.action === 'submit_review') result = await submitKnowledgeForReview(values.id, version, session.username)
      else if (body.action === 'publish') result = await publishKnowledgeEntry(values.id, version, session.username)
      else if (body.action === 'archive') result = await archiveKnowledgeResource(resource, values.id, version, session.username)
      else return NextResponse.json({ success: false, code: 'INVALID_ACTION' }, { status: 400 })
    } else {
      const statusByAction: Record<string, EvidenceReviewStatus> = { review: 'review', verify: 'verified', reject: 'rejected', archive: 'archived' }
      const status = statusByAction[String(body.action || '')]
      if (!status) return NextResponse.json({ success: false, code: 'INVALID_ACTION' }, { status: 400 })
      result = await updateEvidenceReviewStatus(resource, values.id, status, version, session.username)
    }
    if (result.ok) invalidateAssistantKnowledgeCache()
    return knowledgeMutationResponse(result)
  } catch (error) {
    return knowledgeErrorResponse(error)
  }
}
