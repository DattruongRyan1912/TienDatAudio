import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse, contentMutationResponse } from '@/lib/content-http'
import { archiveContentPost, getContentPostById, updateContentPost } from '@/lib/content-repository'
import { refreshPublishedContent } from '@/lib/content-publishing'

type Context = { params: Promise<unknown> }

async function routeId(params: Promise<unknown>) {
  return String(((await params) as { id?: string }).id || '')
}

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const post = await getContentPostById(await routeId(params))
    return post
      ? NextResponse.json({ success: true, data: post })
      : NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 })
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { post?: unknown; version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, message: 'Thiếu version hợp lệ' }, { status: 400 })
    const result = await updateContentPost(await routeId(params), body.post ?? body, version, { actor: session.username })
    if (result.ok && ['published', 'archived'].includes(result.post.status)) await refreshPublishedContent(result.post)
    return contentMutationResponse(result)
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, message: 'Thiếu version hợp lệ' }, { status: 400 })
    const result = await archiveContentPost(await routeId(params), version, session.username)
    if (result.ok) await refreshPublishedContent(result.post)
    return contentMutationResponse(result)
  } catch (error) {
    return contentErrorResponse(error)
  }
}
