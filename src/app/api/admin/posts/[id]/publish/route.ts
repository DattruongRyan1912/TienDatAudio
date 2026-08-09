import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse, contentMutationResponse } from '@/lib/content-http'
import { publishContentPost } from '@/lib/content-repository'
import { refreshPublishedContent } from '@/lib/content-publishing'

type Context = { params: Promise<unknown> }

export async function POST(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, message: 'Thiếu version hợp lệ' }, { status: 400 })
    const result = await publishContentPost(String(((await params) as { id?: string }).id || ''), version, session.username)
    if (result.ok) await refreshPublishedContent(result.post)
    return contentMutationResponse(result)
  } catch (error) {
    return contentErrorResponse(error)
  }
}
