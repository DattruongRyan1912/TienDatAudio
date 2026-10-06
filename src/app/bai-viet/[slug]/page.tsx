import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Phone,
  Sparkles,
} from 'lucide-react'
import { notFound, permanentRedirect } from 'next/navigation'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import { getSocialPostBySlug } from '@/modules/social/application/social-post-service'
import SocialPostCard from '@/components/social/SocialPostCard'
import SocialRelatedProduct from '@/components/social/SocialRelatedProduct'
import { getSocialDiscoveryDescription, getSocialDiscoveryTitle } from '@/modules/social/domain/source-content'

type PageProps = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getSocialPostBySlug((await params).slug)
  if (!post) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: false } }
  const image = post.seo.ogImage || post.media.find((item) => item.type === 'image')?.url
  const canonicalPath = post.seo.canonicalPath || `/bai-viet/${post.slug}`
  const discoveryTitle = getSocialDiscoveryTitle({
    title: post.seo.metaTitle || post.title,
    text: post.text,
    excerpt: post.excerpt,
    category: post.category,
  })
  const description =
    getSocialDiscoveryDescription({
      text: post.text,
      excerpt: post.excerpt,
      metaDescription: post.seo.metaDescription,
    }) || `Cập nhật ${post.category.toLocaleLowerCase('vi')} từ Tiến Đạt Audio.`
  const openGraphTitle = getSocialDiscoveryTitle({
    title: post.seo.ogTitle || discoveryTitle,
    text: post.text,
    excerpt: post.excerpt,
    category: post.category,
  })
  const openGraphDescription =
    getSocialDiscoveryDescription({
      text: post.text,
      excerpt: description,
      metaDescription: post.seo.ogDescription,
    }) || description
  return {
    title: `${discoveryTitle} — Tiến Đạt Audio`,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: !post.seo.noIndex, follow: !post.seo.noIndex },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      url: canonicalPath,
      siteName: 'Tiến Đạt Audio',
      title: openGraphTitle,
      description: openGraphDescription,
      images: image ? [{ url: image, alt: discoveryTitle }] : [],
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraphTitle,
      description: openGraphDescription,
      images: image ? [image] : [],
    },
  }
}

export default async function SocialPostDetailPage({ params }: PageProps) {
  const requestedSlug = (await params).slug
  const post = await getSocialPostBySlug(requestedSlug)
  if (!post) notFound()
  if (post.slug !== requestedSlug) permanentRedirect(`/bai-viet/${post.slug}`)

  const [profile, products, editorialPosts] = await Promise.all([
    getBusinessProfile(),
    getProducts(),
    getPublicPosts(100),
  ])
  const relatedProducts = products.filter((product) => post.relatedProductIds.includes(product.id)).slice(0, 4)
  const relatedArticles = editorialPosts.filter((article) => post.relatedArticleIds.includes(article.id)).slice(0, 4)
  const publishedAt = post.publishedAt || post.createdAt
  const articleUrl = `${profile.siteUrl.replace(/\/$/, '')}/bai-viet/${post.slug}`
  const discoveryTitle = getSocialDiscoveryTitle({
    title: post.title,
    text: post.text,
    excerpt: post.excerpt,
    category: post.category,
  })
  const discoveryDescription =
    getSocialDiscoveryDescription({
      text: post.text,
      excerpt: post.excerpt,
      metaDescription: post.seo.metaDescription,
    }) || post.excerpt
  const phoneHref = formatPhoneHref(profile.phone)

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${articleUrl}#article`,
        headline: discoveryTitle,
        description: discoveryDescription,
        datePublished: publishedAt,
        dateModified: post.updatedAt,
        author: { '@type': 'Organization', name: post.author.displayName },
        publisher: { '@id': `${profile.siteUrl.replace(/\/$/, '')}#business` },
        mainEntityOfPage: articleUrl,
        image: post.seo.ogImage || post.media.find((item) => item.type === 'image')?.url,
        articleSection: post.category,
        keywords: post.tags.join(', '),
        inLanguage: 'vi-VN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: profile.siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Góc Audio', item: `${profile.siteUrl}/bai-viet` },
          { '@type': 'ListItem', position: 3, name: discoveryTitle, item: articleUrl },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link href="/bai-viet" className="hover:text-[#d32f2f] transition-colors">
            Góc Audio
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700 line-clamp-1">{discoveryTitle}</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/bai-viet"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#d32f2f] transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại Góc Audio
          </Link>
        </div>

        {/* Main Content & Sidebar */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main Article (8 cols) */}
          <main className="lg:col-span-8">
            <SocialPostCard post={post} detail />
            <p className="mt-4 text-xs text-slate-500">
              Nội dung được chia sẻ bởi ban biên tập {post.author.displayName} — Tiến Đạt Audio Quảng Ngãi.
            </p>
          </main>

          {/* Sidebar (4 cols) */}
          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28">
            {/* Related Equipment */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Thiết bị trong bài viết
              </h3>
              {relatedProducts.length > 0 ? (
                <div className="mt-3">
                  {relatedProducts.map((product) => (
                    <SocialRelatedProduct key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  Xem toàn bộ kho sản phẩm của Tiến Đạt Audio để tìm thiết bị phù hợp.
                </p>
              )}
            </div>

            {/* Related Knowledge Articles */}
            {relatedArticles.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  Bài viết liên quan
                </h3>
                <div className="mt-3 space-y-3">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/kien-thuc/${article.slug}`}
                      className="group block border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
                    >
                      <h4 className="text-xs font-bold text-slate-900 transition-colors group-hover:text-[#0068ff]">
                        {article.title}
                      </h4>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {article.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Advisory Card */}
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-sm">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#d32f2f]">
                <Sparkles size={12} /> Hỗ trợ khách hàng
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                Thích cấu hình này?
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Liên hệ ngay với chúng tôi để nhận báo giá chi tiết và lên phương án khảo sát cho phòng của bạn.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href={`tel:${phoneHref}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#d32f2f] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#b71c1c]"
                >
                  <Phone size={14} />
                  Hotline: {profile.phone}
                </a>
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0068ff] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0052cc]"
                >
                  <MessageCircle size={14} />
                  Chat Zalo Báo Giá
                </a>
                <Link
                  href={`/contact?post=${encodeURIComponent(post.id)}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Đặt lịch nghe thử <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
