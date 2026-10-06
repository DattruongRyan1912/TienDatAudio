import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Package, Radio, Search } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import { listSocialPosts } from '@/modules/social/application/social-post-service'

export const metadata: Metadata = {
  title: 'Tìm kiếm — Tiến Đạt Audio',
  description: 'Tìm kiếm sản phẩm, thiết bị âm thanh, bài viết kiến thức tại Tiến Đạt Audio.',
  alternates: { canonical: '/tim-kiem' },
}

function includesQuery(values: string[], query: string) {
  return values.join(' ').toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = (params.q || '').trim()

  if (!query) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f] transition-colors">
              Trang chủ
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Tìm kiếm</span>
          </nav>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm md:p-12 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-[#d32f2f]">
              <Search size={28} />
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Tìm kiếm sản phẩm & kiến thức âm thanh
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Nhập từ khóa về thương hiệu, tên loa, dòng amply hoặc chủ đề kỹ thuật bạn cần tìm kiếm.
            </p>

            <form action="/tim-kiem" className="mt-8 mx-auto max-w-xl">
              <div className="flex rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-[#d32f2f] focus-within:ring-2 focus-within:ring-red-100">
                <div className="flex items-center pl-3 pr-2 text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  name="q"
                  autoFocus
                  className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Ví dụ: JBL, loa kéo, mixer, dàn karaoke, vang số..."
                  aria-label="Từ khóa tìm kiếm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#d32f2f] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#b71c1c]"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <span className="text-xs font-semibold text-slate-500 block mb-3">
                Gợi ý tìm kiếm phổ biến:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {['JBL', 'Loa kéo', 'Dàn karaoke', 'Bose', 'Vang số', 'Micro không dây', 'Yamaha'].map(
                  (tag) => (
                    <Link
                      key={tag}
                      href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f] transition-colors"
                    >
                      {tag}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [products, editorialPosts, socialResult] = await Promise.all([
    getProducts({ search: query, limit: 24 }),
    getPublicPosts(200),
    listSocialPosts({ search: query, limit: 24 }),
  ])

  const articles = editorialPosts
    .filter((post) => includesQuery([post.title, post.excerpt, post.category, ...post.tags], query))
    .slice(0, 12)
  const total = products.length + articles.length + socialResult.items.length

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Kết quả tìm kiếm</span>
        </nav>

        {/* Search Header Bar */}
        <div className="mb-10 flex flex-col justify-between gap-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
              Kết quả tra cứu
            </span>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
              Từ khóa: “{query}”
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Tìm thấy <strong>{total}</strong> kết quả (gồm {products.length} sản phẩm, {articles.length} bài kiến thức, {socialResult.items.length} tin Góc Audio)
            </p>
          </div>

          <form action="/tim-kiem" className="w-full md:max-w-md">
            <div className="flex rounded-xl border border-slate-300 bg-slate-50/50 p-1.5 focus-within:bg-white focus-within:border-[#d32f2f] focus-within:ring-2 focus-within:ring-red-100">
              <input
                name="q"
                defaultValue={query}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Tìm từ khóa khác..."
                aria-label="Từ khóa tìm kiếm"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#d32f2f] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#b71c1c]"
              >
                Tìm lại
              </button>
            </div>
          </form>
        </div>

        {/* 1. Products Section */}
        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-[#d32f2f]" />
              <h2 className="text-xl font-bold text-slate-900">
                Sản phẩm phù hợp ({products.length})
              </h2>
            </div>
            {products.length > 0 && (
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#d32f2f] hover:underline"
              >
                Xem trong catalog <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <SonicProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Không tìm thấy sản phẩm nào khớp với từ khóa “{query}”.
            </div>
          )}
        </section>

        {/* 2. Knowledge Articles Section */}
        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-[#0068ff]" />
              <h2 className="text-xl font-bold text-slate-900">
                Bài viết Kiến thức ({articles.length})
              </h2>
            </div>
            <Link
              href="/kien-thuc"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0068ff] hover:underline"
            >
              Xem tất cả kiến thức <ArrowRight size={12} />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((post) => (
                <Link
                  key={post.id}
                  href={`/kien-thuc/${post.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0068ff]">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-slate-900 transition-colors group-hover:text-[#0068ff]">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0068ff]">
                    Đọc bài viết <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Không có bài viết kiến thức nào khớp với từ khóa “{query}”.
            </div>
          )}
        </section>

        {/* 3. Social Hub Section */}
        {socialResult.items.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Radio size={20} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Góc Audio & Tin tức ({socialResult.items.length})
                </h2>
              </div>
              <Link
                href="/bai-viet"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
              >
                Xem Góc Audio <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {socialResult.items.map((post) => (
                <Link
                  key={post.id}
                  href={`/bai-viet/${post.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    Xem chi tiết <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
