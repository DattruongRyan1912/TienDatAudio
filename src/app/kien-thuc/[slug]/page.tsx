import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicArticle from '@/components/content/PublicArticle'
import { getBusinessProfile } from '@/lib/business-profile'
import { getContentPostBySlug, getPublicPosts } from '@/lib/content-repository'
import { getProducts } from '@/lib/catalog'
import { getSEOConfig } from '@/lib/seo-strategy'

type ArticlePageProps = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  return (await getPublicPosts(100)).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const [post, profile, config] = await Promise.all([getContentPostBySlug(slug, true), getBusinessProfile(), getSEOConfig()])
  if (!post) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: false } }
  const keywordTerms = config.keywords.filter((keyword) => post.keywordIds.includes(keyword.id)).map((keyword) => keyword.term)
  const canonicalPath = post.seo.canonicalPath || `/kien-thuc/${post.slug}`
  const image = post.seo.ogImage || post.featuredImage || `/kien-thuc/${post.slug}/opengraph-image`
  return {
    title: post.seo.metaTitle || `${post.title} — ${profile.name}`,
    description: post.seo.metaDescription || post.excerpt,
    keywords: keywordTerms,
    alternates: { canonical: canonicalPath },
    robots: { index: !post.seo.noIndex, follow: !post.seo.noIndex },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      url: canonicalPath,
      siteName: profile.name,
      title: post.seo.ogTitle || post.seo.metaTitle || post.title,
      description: post.seo.ogDescription || post.seo.metaDescription || post.excerpt,
      images: image ? [{ url: image, alt: post.title }] : [],
      publishedTime: post.publishedAt || post.scheduledAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = await getContentPostBySlug(slug, true)
  if (!post) notFound()
  const [allPosts, allProducts, profile] = await Promise.all([getPublicPosts(200), getProducts(), getBusinessProfile()])
  const explicitRelated = post.relatedPostIds.map((id) => allPosts.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
  const inferredRelated = allPosts.filter((item) => item.id !== post.id && (item.category === post.category || item.keywordIds.some((id) => post.keywordIds.includes(id))))
  const relatedPosts = Array.from(new Map([...explicitRelated, ...inferredRelated].map((item) => [item.id, item])).values()).slice(0, 4)
  const relatedProducts = post.relatedProductIds.map((id) => allProducts.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 3)
  return <PublicArticle post={post} relatedPosts={relatedPosts} relatedProducts={relatedProducts} profile={profile} />
}
