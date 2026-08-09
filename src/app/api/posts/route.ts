import { NextResponse } from 'next/server'
import { listSocialPosts } from '@/modules/social/application/social-post-service'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const data = await listSocialPosts({
    search: params.get('q') || params.get('search') || undefined,
    category: params.get('category') || undefined,
    page: Number(params.get('page')) || 1,
    limit: Number(params.get('limit')) || 12,
  })
  return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } })
}
