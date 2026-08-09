import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { createSocialPost, listSocialPosts } from '@/modules/social/application/social-post-service'
import { refreshPublishedSocialPost } from '@/modules/social/application/social-publishing'
import { socialErrorResponse, socialMutationResponse } from '@/modules/social/presentation/social-http'
import type { PostStatus } from '@/lib/content-types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const params = new URL(request.url).searchParams
    const data = await listSocialPosts({
      status: (params.get('status') || 'all') as PostStatus | 'all',
      search: params.get('search') || undefined,
      category: params.get('category') || undefined,
      page: Number(params.get('page')) || 1,
      limit: Number(params.get('limit')) || 30,
    }, false)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return socialErrorResponse(error)
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { post?: unknown }
    const result = await createSocialPost(body.post ?? body)
    if (result.ok && result.post.status === 'published') await refreshPublishedSocialPost(result.post)
    return socialMutationResponse(result, 201)
  } catch (error) {
    return socialErrorResponse(error)
  }
}
