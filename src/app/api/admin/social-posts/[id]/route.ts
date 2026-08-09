import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { archiveSocialPost, getSocialPostById, updateSocialPost } from '@/modules/social/application/social-post-service'
import { refreshPublishedSocialPost } from '@/modules/social/application/social-publishing'
import { socialErrorResponse, socialMutationResponse } from '@/modules/social/presentation/social-http'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const post = await getSocialPostById((await params).id)
    if (!post) return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 })
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    return socialErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const id = (await params).id
    const body = await request.json() as { post?: unknown; version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, message: 'Thiếu version hợp lệ' }, { status: 400 })
    const result = await updateSocialPost(id, body.post ?? body, version, { actor: session.username })
    if (result.ok && result.post.status === 'published') await refreshPublishedSocialPost(result.post)
    return socialMutationResponse(result)
  } catch (error) {
    return socialErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { version?: number }
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) return NextResponse.json({ success: false, message: 'Thiếu version hợp lệ' }, { status: 400 })
    const result = await archiveSocialPost((await params).id, version, session.username)
    if (result.ok) await refreshPublishedSocialPost(result.post)
    return socialMutationResponse(result)
  } catch (error) {
    return socialErrorResponse(error)
  }
}
