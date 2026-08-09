import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicArticle from '@/components/content/PublicArticle'
import { requireAdmin } from '@/lib/admin-guard'
import { getBusinessProfile } from '@/lib/business-profile'
import { getContentPostById, getPublicPosts } from '@/lib/content-repository'
import { getProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Preview bài viết', robots: { index: false, follow: false } }

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) notFound()
  const post = await getContentPostById((await params).id)
  if (!post) notFound()
  const [allPosts, allProducts, profile] = await Promise.all([getPublicPosts(200), getProducts(), getBusinessProfile()])
  const relatedPosts = post.relatedPostIds.map((id) => allPosts.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 4)
  const relatedProducts = post.relatedProductIds.map((id) => allProducts.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 3)
  return <PublicArticle post={post} relatedPosts={relatedPosts} relatedProducts={relatedProducts} profile={profile} preview />
}
