import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse, contentMutationResponse } from '@/lib/content-http'
import { createContentPost, listContentPosts } from '@/lib/content-repository'
import type { PostStatus } from '@/lib/content-types'
import { refreshPublishedContent } from '@/lib/content-publishing'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const params = new URL(request.url).searchParams
    const data = await listContentPosts({
      status: (params.get('status') || 'all') as PostStatus | 'all',
      search: params.get('search') || undefined,
      keywordId: params.get('keywordId') || undefined,
      category: params.get('category') || undefined,
      page: Number(params.get('page')) || 1,
      limit: Number(params.get('limit')) || 30,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { post?: unknown }
    const result = await createContentPost(body.post ?? body)
    if (result.ok && result.post.status === 'published') await refreshPublishedContent(result.post)
    return contentMutationResponse(result, 201)
  } catch (error) {
    return contentErrorResponse(error)
  }
}
