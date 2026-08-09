import { NextResponse } from 'next/server'
import { getSocialPostBySlug } from '@/modules/social/application/social-post-service'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = await getSocialPostBySlug((await params).slug)
  if (!post) return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 })
  return NextResponse.json({ success: true, data: post }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } })
}
