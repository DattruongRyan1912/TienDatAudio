import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse, contentMutationResponse } from '@/lib/content-http'
import { restorePostRevision } from '@/lib/content-repository'
import { refreshPublishedContent } from '@/lib/content-publishing'

type Context = { params: Promise<unknown> }

export async function POST(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { revisionId?: string; version?: number }
    if (!body.revisionId || !Number.isInteger(Number(body.version))) {
      return NextResponse.json({ success: false, message: 'Thiếu revisionId hoặc version' }, { status: 400 })
    }
    const result = await restorePostRevision(String(((await params) as { id?: string }).id || ''), body.revisionId, Number(body.version), session.username)
    if (result.ok && result.post.status === 'published') await refreshPublishedContent(result.post)
    return contentMutationResponse(result)
  } catch (error) {
    return contentErrorResponse(error)
  }
}
