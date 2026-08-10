import { NextResponse } from 'next/server'
import { buildLLMSText, buildMarkdownLink, getSEOConfig } from '@/lib/seo-strategy'
import { getBusinessProfile } from '@/lib/business-profile'
import { getPublicPosts } from '@/lib/content-repository'
import { getAllPublicSocialPosts } from '@/modules/social/application/social-post-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [config, profile, posts, socialPosts] = await Promise.all([getSEOConfig(), getBusinessProfile(), getPublicPosts(100), getAllPublicSocialPosts()])
  const baseText = buildLLMSText(config, profile, posts).trimEnd()
  const siteUrl = profile.siteUrl.replace(/\/$/, '')
  const socialText = socialPosts.length
    ? `\n\n## Published Social Hub\n\n${socialPosts.map((post) => `- ${buildMarkdownLink(post.title, `/bai-viet/${post.slug}`, siteUrl)}: ${post.excerpt}`).join('\n')}`
    : ''
  return new NextResponse(`${baseText}${socialText}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
