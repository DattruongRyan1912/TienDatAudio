import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { restoreSocialPostRevision } from '@/modules/social/application/social-post-service'
import { refreshPublishedSocialPost } from '@/modules/social/application/social-publishing'
import { socialErrorResponse, socialMutationResponse } from '@/modules/social/presentation/social-http'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { revisionId?: string; version?: number }
    const version = Number(body.version)
    if (!body.revisionId || !Number.isInteger(version) || version < 1) {
      return NextResponse.json({ success: false, message: 'Thiếu revision hoặc version hợp lệ' }, { status: 400 })
    }
    const result = await restoreSocialPostRevision((await params).id, body.revisionId, version, session.username)
    if (result.ok && ['published', 'archived'].includes(result.post.status)) await refreshPublishedSocialPost(result.post)
    return socialMutationResponse(result)
  } catch (error) {
    return socialErrorResponse(error)
  }
}
