import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, MessageCircle, Phone, Radio, Search } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/catalog'
import { SOCIAL_CATEGORIES } from '@/modules/social/domain/types'
import { listSocialPosts } from '@/modules/social/application/social-post-service'
import { isSocialHubEnabled } from '@/modules/social/domain/feature-flag'
import SocialPostCard from '@/components/social/SocialPostCard'
import SocialRelatedProduct from '@/components/social/SocialRelatedProduct'
import { generateSEOMetadata } from '@/lib/seo'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/bai-viet',
  title: 'Góc Audio — Cập nhật & Trải nghiệm thực tế | Tiến Đạt Audio',
  description:
    'Những câu chuyện, hình ảnh setup dàn karaoke, dự án âm thanh thực tế và chia sẻ trải nghiệm mới nhất từ Showroom Tiến Đạt Audio Quảng Ngãi.',
  keywords: [
    'góc audio Quảng Ngãi',
    'thiết bị âm thanh Quảng Ngãi',
    'loa Quảng Ngãi',
    'setup âm thanh Quảng Ngãi',
  ],
})

export const revalidate = 300

function queryLink(params: { q?: string; category?: string }, next: { category?: string; q?: string }) {
  const values = new URLSearchParams()
  const q = next.q !== undefined ? next.q : params.q
  const category = next.category !== undefined ? next.category : params.category
  if (q) values.set('q', q)
  if (category) values.set('category', category)
  const query = values.toString()
  return `/bai-viet${query ? `?${query}` : ''}`
}

export default async function SocialHubPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  if (!isSocialHubEnabled()) notFound()
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const [{ items: posts, total, limit }, trendingProducts, profile] = await Promise.all([
    listSocialPosts({ search: params.q, category: params.category, page, limit: 8 }),
    getFeaturedProducts(4),
    getBusinessProfile(),
  ])
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const phoneHref = formatPhoneHref(profile.phone)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Góc Audio</span>
        </nav>

        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
              <Radio size={14} /> Trải nghiệm thực tế từ Showroom
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Góc Audio Tiến Đạt
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600 leading-relaxed">
              Những hình ảnh thực tế về các dự án lắp đặt, bàn giao dàn karaoke, mẹo căn chỉnh âm học và cảm nhận từ những người yêu âm nhạc tại Quảng Ngãi.
            </p>
          </div>

          <form action="/bai-viet" className="w-full lg:max-w-xs">
            <div className="flex rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-[#d32f2f] focus-within:ring-2 focus-within:ring-red-100">
              <input
                name="q"
                defaultValue={params.q || ''}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm tin tức, bài viết..."
                aria-label="Tìm Social Post"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#d32f2f] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#b71c1c]"
              >
                <Search size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* Category Filter Chips */}
        <nav className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="Lọc chuyên mục Góc Audio">
          <Link
            href={queryLink(params, { category: '' })}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              !params.category
                ? 'bg-[#d32f2f] text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </Link>
          {SOCIAL_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={queryLink(params, { category })}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                params.category === category
                  ? 'bg-[#d32f2f] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {category}
            </Link>
          ))}
        </nav>

        {/* Feed & Sidebar Grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main Feed: 8 cols */}
          <main className="space-y-6 lg:col-span-8" aria-label="Danh sách bài viết">
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#d32f2f]">
                  <Radio size={28} />
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-900">Chưa có bài viết mới</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                  Nội dung đang được ban biên tập Tiến Đạt Audio hoàn thiện. Bạn có thể xem các danh mục sản phẩm hoặc liên hệ để được hỗ trợ.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#b71c1c]"
                >
                  Liên hệ tư vấn
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              posts.map((post, index) => {
                const relatedProducts = trendingProducts.filter((product) =>
                  post.relatedProductIds.includes(product.id)
                )
                if (index === 0) return <SocialPostCard key={post.id} post={post} relatedProducts={relatedProducts} priorityMedia />
                return (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    relatedProducts={relatedProducts}
                  />
                )
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                aria-label="Phân trang"
              >
                <div>
                  {page > 1 ? (
                    <Link
                      href={`/bai-viet?${new URLSearchParams({
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category ? { category: params.category } : {}),
                        page: String(page - 1),
                      })}`}
                      className="text-xs font-bold text-[#d32f2f] hover:underline"
                    >
                      ← Trang trước
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-300">← Trang trước</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  Trang {page} / {totalPages}
                </span>
                <div>
                  {page < totalPages ? (
                    <Link
                      href={`/bai-viet?${new URLSearchParams({
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category ? { category: params.category } : {}),
                        page: String(page + 1),
                      })}`}
                      className="text-xs font-bold text-[#d32f2f] hover:underline"
                    >
                      Trang sau →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-300">Trang sau →</span>
                  )}
                </div>
              </nav>
            )}
          </main>

          {/* Sidebar: 4 cols */}
          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28">
            {/* Featured Products Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Thiết bị được quan tâm
              </h3>
              <div className="mt-3">
                {trendingProducts.length > 0 ? (
                  trendingProducts.map((product) => (
                    <SocialRelatedProduct key={product.id} product={product} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Đang cập nhật thiết bị.</p>
                )}
              </div>
            </div>

            {/* Quick Hotline Advisory Card */}
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-sm">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#d32f2f]">
                Tư vấn miễn phí
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">
                Cần tư vấn phối ghép cho phòng của bạn?
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Đội ngũ kỹ thuật viên của Tiến Đạt Audio luôn sẵn sàng hỗ trợ khảo sát và tư vấn mọi lúc.
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
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
