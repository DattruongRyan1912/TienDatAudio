import { NextResponse } from 'next/server'
import { buildLLMSText, getSEOConfig } from '@/lib/seo-strategy'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await getSEOConfig()
  return new NextResponse(buildLLMSText(config), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
