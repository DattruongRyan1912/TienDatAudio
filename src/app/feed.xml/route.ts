import { NextResponse } from 'next/server'
import { getBusinessProfile } from '@/lib/business-profile'
import { getPublicPosts } from '@/lib/content-repository'
import { getAllPublicSocialPosts } from '@/modules/social/application/social-post-service'

export const revalidate = 300

function xml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character] || character)
}

export async function GET() {
  const [profile, posts, socialPosts] = await Promise.all([getBusinessProfile(), getPublicPosts(100), getAllPublicSocialPosts()])
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const editorialItems = posts.map((post) => {
    const url = `${baseUrl}/kien-thuc/${post.slug}`
    const publishedAt = post.publishedAt || post.scheduledAt || post.createdAt
    return { publishedAt, xml: `<item><title>${xml(post.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(post.excerpt)}</description><category>${xml(post.category)}</category><dc:creator>${xml(post.author)}</dc:creator><pubDate>${new Date(publishedAt).toUTCString()}</pubDate></item>` }
  })
  const socialItems = socialPosts.map((post) => {
    const url = `${baseUrl}/bai-viet/${post.slug}`
    const publishedAt = post.publishedAt || post.scheduledAt || post.createdAt
    return { publishedAt, xml: `<item><title>${xml(post.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(post.excerpt)}</description><category>${xml(post.category)}</category><dc:creator>${xml(post.author.displayName)}</dc:creator><pubDate>${new Date(publishedAt).toUTCString()}</pubDate></item>` }
  })
  const items = [...editorialItems, ...socialItems].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).map((item) => item.xml).join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${xml(profile.name)} — Audio &amp; Social Hub</title><link>${xml(baseUrl)}</link><description>${xml(profile.description)}</description><language>vi-VN</language><atom:link href="${xml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
