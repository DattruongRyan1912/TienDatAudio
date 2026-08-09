import { NextResponse } from 'next/server'
import { buildLLMSText, getSEOConfig } from '@/lib/seo-strategy'
import { getBusinessProfile } from '@/lib/business-profile'
import { getPublicPosts } from '@/lib/content-repository'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [config, profile, posts] = await Promise.all([getSEOConfig(), getBusinessProfile(), getPublicPosts(100)])
  return new NextResponse(buildLLMSText(config, profile, posts), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
