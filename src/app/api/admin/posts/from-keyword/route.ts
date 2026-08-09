import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse, contentMutationResponse } from '@/lib/content-http'
import { createContentPost } from '@/lib/content-repository'
import { buildKeywordDraft } from '@/lib/content-seo'
import { getSEOConfig } from '@/lib/seo-strategy'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { keywordId?: string }
    const keyword = (await getSEOConfig()).keywords.find((item) => item.id === body.keywordId && item.isActive)
    if (!keyword) return NextResponse.json({ success: false, message: 'Không tìm thấy keyword đang hoạt động' }, { status: 404 })
    return contentMutationResponse(await createContentPost(buildKeywordDraft(keyword)), 201)
  } catch (error) {
    return contentErrorResponse(error)
  }
}
