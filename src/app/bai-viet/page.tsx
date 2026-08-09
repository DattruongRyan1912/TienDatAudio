import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Search } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/catalog'
import { SOCIAL_CATEGORIES } from '@/modules/social/domain/types'
import { listSocialPosts } from '@/modules/social/application/social-post-service'
import { isSocialHubEnabled } from '@/modules/social/domain/feature-flag'
import SocialPostCard from '@/components/social/SocialPostCard'
import SocialRelatedProduct from '@/components/social/SocialRelatedProduct'
import SonicReveal from '@/components/sonic/SonicReveal'

export const metadata: Metadata = {
  title: 'Góc Audio — Tiến Đạt Audio',
  description: 'Những câu chuyện, setup, sản phẩm và trải nghiệm âm thanh mới nhất từ Tiến Đạt Audio.',
  alternates: { canonical: '/bai-viet' },
}

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

export default async function SocialHubPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  if (!isSocialHubEnabled()) notFound()
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const [{ items: posts, total, limit }, trendingProducts] = await Promise.all([
    listSocialPosts({ search: params.q, category: params.category, page, limit: 8 }),
    getFeaturedProducts(3),
  ])
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return <div className="sonic-page pt-28 md:pt-36">
    <SonicReveal><section className="sonic-container pb-12 md:pb-16">
      <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div><p className="sonic-label">Social / Audio lifestyle</p><h1 className="sonic-title mt-5 max-w-3xl">Góc Audio.</h1><p className="sonic-copy mt-5 max-w-xl">Những gì đang diễn ra tại showroom, trong các hệ thống đã lắp đặt và giữa những người yêu âm thanh.</p></div>
        <form action="/bai-viet" className="relative w-full lg:max-w-sm"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sonic-subtle)]" /><input name="q" defaultValue={params.q || ''} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm bài viết, sản phẩm..." aria-label="Tìm Social Post" /></form>
      </div>
      <nav className="mt-10 flex gap-2 overflow-x-auto pb-2" aria-label="Lọc Social Hub">
        <Link href={queryLink(params, { category: '' })} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors ${!params.category ? 'border-[var(--sonic-gold)] bg-[var(--sonic-gold-soft)] text-[var(--sonic-gold)]' : 'border-[var(--sonic-line)] text-[var(--sonic-muted)] hover:border-[var(--sonic-gold)]'}`}>Tất cả</Link>
        {SOCIAL_CATEGORIES.map((category) => <Link key={category} href={queryLink(params, { category })} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors ${params.category === category ? 'border-[var(--sonic-gold)] bg-[var(--sonic-gold-soft)] text-[var(--sonic-gold)]' : 'border-[var(--sonic-line)] text-[var(--sonic-muted)] hover:border-[var(--sonic-gold)]'}`}>{category}</Link>)}
      </nav>
    </section></SonicReveal>

    <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-10 md:py-14">
      <div className="sonic-container grid gap-10 lg:grid-cols-[minmax(0,1fr)_250px_250px] lg:items-start">
        <main className="mx-auto w-full max-w-[760px] space-y-5" aria-label="Social feed">
          {posts.length === 0 ? <div className="social-post-card py-16 text-center"><p className="sonic-label">Chưa có bài viết public</p><h2 className="mt-4 text-2xl font-bold text-[var(--sonic-text)]">Góc Audio đang được biên tập.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--sonic-muted)]">Khi bài viết đầu tiên được xuất bản, feed sẽ xuất hiện tại đây.</p><Link href="/contact" className="sonic-button sonic-button-gold mt-7">Nhận tư vấn <ArrowUpRight size={15} /></Link></div> : posts.map((post, index) => {
            const relatedProducts = trendingProducts.filter((product) => post.relatedProductIds.includes(product.id))
            return <SonicReveal key={post.id} delay={Math.min(index * 0.06, 0.24)}><SocialPostCard post={post} relatedProducts={relatedProducts} /></SonicReveal>
          })}
          {totalPages > 1 && <nav className="flex items-center justify-between border-t border-[var(--sonic-line)] pt-5" aria-label="Phân trang Social Hub"><div>{page > 1 && <Link href={`/bai-viet?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(params.category ? { category: params.category } : {}), page: String(page - 1) })}`} className="text-xs font-bold text-[var(--sonic-gold)]">← Trang trước</Link>}</div><span className="text-xs text-[var(--sonic-subtle)]">{page} / {totalPages}</span><div>{page < totalPages && <Link href={`/bai-viet?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(params.category ? { category: params.category } : {}), page: String(page + 1) })}`} className="text-xs font-bold text-[var(--sonic-gold)]">Trang sau →</Link>}</div></nav>}
        </main>

        <aside className="hidden lg:block lg:sticky lg:top-28"><p className="sonic-label">Bộ lọc</p><div className="mt-5 grid gap-2 border-l border-[var(--sonic-line)] pl-4">{SOCIAL_CATEGORIES.slice(0, 7).map((category) => <Link key={category} href={queryLink(params, { category })} className="text-sm text-[var(--sonic-muted)] hover:text-[var(--sonic-gold)]">{category}</Link>)}</div></aside>
        <aside className="hidden lg:block lg:sticky lg:top-28"><p className="sonic-label">Thiết bị được quan tâm</p><div className="mt-4 rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-3">{trendingProducts.length ? trendingProducts.map((product) => <SocialRelatedProduct key={product.id} product={product} />) : <p className="text-sm text-[var(--sonic-muted)]">Danh mục đang cập nhật.</p>}</div><Link href="/contact" className="sonic-button sonic-button-gold mt-5 w-full">Nhận tư vấn <ArrowUpRight size={15} /></Link></aside>
      </div>
    </section>
  </div>
}
