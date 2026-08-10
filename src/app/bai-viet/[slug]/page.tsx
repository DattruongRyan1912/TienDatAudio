import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Phone } from 'lucide-react'
import { notFound, permanentRedirect } from 'next/navigation'
import { getBusinessProfile } from '@/lib/business-profile'
import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import { getSocialPostBySlug } from '@/modules/social/application/social-post-service'
import SocialPostCard from '@/components/social/SocialPostCard'
import SocialRelatedProduct from '@/components/social/SocialRelatedProduct'
import SonicReveal from '@/components/sonic/SonicReveal'

type PageProps = { params: Promise<{ slug: string }> }

// The root layout reads the theme cookie. Social posts are also created in
// MongoDB after build time, so this CMS detail route must render dynamically.
// Keeping it in the static/revalidate pipeline causes DYNAMIC_SERVER_USAGE and
// a 500 response in production.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getSocialPostBySlug((await params).slug)
  if (!post) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: false } }
  const image = post.seo.ogImage || post.media.find((item) => item.type === 'image')?.url
  return {
    title: post.seo.metaTitle || `${post.title} — Tiến Đạt Audio`,
    description: post.seo.metaDescription || post.excerpt,
    alternates: { canonical: post.seo.canonicalPath || `/bai-viet/${post.slug}` },
    robots: { index: !post.seo.noIndex, follow: !post.seo.noIndex },
    openGraph: { type: 'article', locale: 'vi_VN', title: post.seo.ogTitle || post.title, description: post.seo.ogDescription || post.excerpt, images: image ? [{ url: image, alt: post.title }] : [], publishedTime: post.publishedAt || undefined, modifiedTime: post.updatedAt, section: post.category, tags: post.tags },
  }
}

export default async function SocialPostDetailPage({ params }: PageProps) {
  const requestedSlug = (await params).slug
  const post = await getSocialPostBySlug(requestedSlug)
  if (!post) notFound()
  if (post.slug !== requestedSlug) permanentRedirect(`/bai-viet/${post.slug}`)
  const [profile, products, editorialPosts] = await Promise.all([getBusinessProfile(), getProducts(), getPublicPosts(100)])
  const relatedProducts = products.filter((product) => post.relatedProductIds.includes(product.id)).slice(0, 4)
  const relatedArticles = editorialPosts.filter((article) => post.relatedArticleIds.includes(article.id)).slice(0, 4)
  const publishedAt = post.publishedAt || post.createdAt
  const articleUrl = `${profile.siteUrl.replace(/\/$/, '')}/bai-viet/${post.slug}`
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', '@id': `${articleUrl}#article`, headline: post.title, description: post.excerpt, datePublished: publishedAt, dateModified: post.updatedAt, author: { '@type': 'Organization', name: post.author.displayName }, publisher: { '@id': `${profile.siteUrl.replace(/\/$/, '')}#business` }, mainEntityOfPage: articleUrl, image: post.seo.ogImage || post.media.find((item) => item.type === 'image')?.url, articleSection: post.category, keywords: post.tags.join(', '), inLanguage: 'vi-VN' },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: profile.siteUrl }, { '@type': 'ListItem', position: 2, name: 'Góc Audio', item: `${profile.siteUrl}/bai-viet` }, { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl }] },
    ],
  }

  return <div className="sonic-page pt-28 md:pt-36"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} /><div className="sonic-container pb-20 md:pb-28"><SonicReveal><Link href="/bai-viet" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-subtle)] hover:text-[var(--sonic-gold)]"><ArrowLeft size={14} /> Góc Audio</Link></SonicReveal><div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,760px)_300px] lg:items-start lg:justify-center lg:gap-16"><main><SonicReveal><SocialPostCard post={post} detail /></SonicReveal><p className="mt-4 text-xs text-[var(--sonic-subtle)]">Nội dung được xuất bản bởi {post.author.displayName}. Hãy kiểm tra thiết bị trong bài và trao đổi theo không gian thực tế của bạn.</p></main><SonicReveal direction="right" delay={0.1} className="space-y-6 lg:sticky lg:top-28"><aside><section className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-5"><p className="sonic-label">Thiết bị trong bài</p>{relatedProducts.length ? <div className="mt-4">{relatedProducts.map((product) => <SocialRelatedProduct key={product.id} product={product} />)}</div> : <p className="mt-4 text-sm leading-6 text-[var(--sonic-muted)]">Bài viết chưa gắn thiết bị. Xem danh mục để tìm cấu hình phù hợp.</p>}</section>{relatedArticles.length > 0 && <section className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-5"><p className="sonic-label">Đọc tiếp</p><div className="mt-4 grid gap-4">{relatedArticles.map((article) => <Link key={article.id} href={`/kien-thuc/${article.slug}`} className="border-t border-[var(--sonic-line)] pt-3 text-sm font-bold text-[var(--sonic-text)] hover:text-[var(--sonic-gold)]">{article.title}<span className="mt-1 block text-xs font-normal text-[var(--sonic-subtle)]">{article.category}</span></Link>)}</div></section>}<section className="rounded-lg border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold-soft)] p-5"><p className="sonic-label">Bắt đầu từ không gian thật</p><h2 className="mt-3 text-xl font-bold text-[var(--sonic-text)]">Cần tư vấn phối ghép?</h2><p className="mt-3 text-sm leading-6 text-[var(--sonic-muted)]">Đội ngũ Tiến Đạt Audio sẽ giúp bạn chọn cấu hình có lý do.</p><Link href={`/contact?post=${encodeURIComponent(post.id)}`} className="sonic-button sonic-button-gold mt-5 w-full">Nhận tư vấn <ArrowUpRight size={15} /></Link><a href={`tel:${profile.phone.replace(/\D/g, '')}`} className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-[var(--sonic-gold)]"><Phone size={13} />{profile.phone}</a></section></aside></SonicReveal></div></div></div>
}
