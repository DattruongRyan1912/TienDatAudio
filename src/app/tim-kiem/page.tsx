import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import { listSocialPosts } from '@/modules/social/application/social-post-service'

export const metadata: Metadata = {
  title: 'Tìm kiếm — Tiến Đạt Audio',
  description: 'Tìm sản phẩm, bài viết kiến thức và cập nhật mới từ Tiến Đạt Audio.',
  alternates: { canonical: '/tim-kiem' },
}

function includesQuery(values: string[], query: string) {
  return values.join(' ').toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const query = (params.q || '').trim()
  if (!query) return <div className="sonic-page pt-28 md:pt-36"><section className="sonic-container pb-24"><p className="sonic-label">Discovery / Search</p><h1 className="sonic-title mt-5">Tìm đúng thứ bạn cần.</h1><form action="/tim-kiem" className="relative mt-10 max-w-2xl"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sonic-subtle)]" /><input name="q" autoFocus className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm loa, ampli, thương hiệu, bài viết..." aria-label="Từ khóa tìm kiếm" /></form></section></div>

  const [products, editorialPosts, socialResult] = await Promise.all([getProducts({ search: query, limit: 24 }), getPublicPosts(200), listSocialPosts({ search: query, limit: 24 })])
  const articles = editorialPosts.filter((post) => includesQuery([post.title, post.excerpt, post.category, ...post.tags], query)).slice(0, 12)
  const total = products.length + articles.length + socialResult.items.length

  return <div className="sonic-page pt-28 md:pt-36"><section className="sonic-container pb-12 md:pb-16"><p className="sonic-label">Discovery / Search</p><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h1 className="sonic-title mt-5">Kết quả cho “{query}”.</h1><p className="sonic-copy mt-5">{total} kết quả từ catalog, kiến thức và Social Hub.</p></div><form action="/tim-kiem" className="relative w-full md:max-w-sm"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sonic-subtle)]" /><input name="q" defaultValue={query} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm lại..." aria-label="Từ khóa tìm kiếm" /></form></div></section><section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-12 md:py-16"><div className="sonic-container grid gap-14">
    <section><div className="flex items-end justify-between gap-4"><div><p className="sonic-label">01 / Catalog</p><h2 className="mt-3 text-2xl font-bold text-[var(--sonic-text)]">Sản phẩm</h2></div><Link href={`/products?search=${encodeURIComponent(query)}`} className="text-xs font-bold text-[var(--sonic-gold)]">Xem catalog <ArrowUpRight size={14} className="inline" /></Link></div>{products.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 8).map((product) => <SonicProductCard key={product.id} product={product} />)}</div> : <p className="mt-5 text-sm text-[var(--sonic-muted)]">Không tìm thấy sản phẩm phù hợp.</p>}</section>
    <section><div className="flex items-end justify-between gap-4"><div><p className="sonic-label">02 / Journal</p><h2 className="mt-3 text-2xl font-bold text-[var(--sonic-text)]">Kiến thức</h2></div><Link href="/kien-thuc" className="text-xs font-bold text-[var(--sonic-gold)]">Xem kiến thức <ArrowUpRight size={14} className="inline" /></Link></div>{articles.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{articles.map((post) => <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="sonic-panel group p-5"><p className="sonic-label">{post.category}</p><h3 className="mt-5 text-lg font-bold leading-tight text-[var(--sonic-text)] group-hover:text-[var(--sonic-gold)]">{post.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--sonic-muted)]">{post.excerpt}</p></Link>)}</div> : <p className="mt-5 text-sm text-[var(--sonic-muted)]">Không tìm thấy bài kiến thức phù hợp.</p>}</section>
    <section><div className="flex items-end justify-between gap-4"><div><p className="sonic-label">03 / Social</p><h2 className="mt-3 text-2xl font-bold text-[var(--sonic-text)]">Góc Audio</h2></div><Link href="/bai-viet" className="text-xs font-bold text-[var(--sonic-gold)]">Xem Social Hub <ArrowUpRight size={14} className="inline" /></Link></div>{socialResult.items.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{socialResult.items.map((post) => <Link key={post.id} href={`/bai-viet/${post.slug}`} className="sonic-panel group p-5"><p className="sonic-label">{post.category} · {post.author.displayName}</p><h3 className="mt-5 text-lg font-bold leading-tight text-[var(--sonic-text)] group-hover:text-[var(--sonic-gold)]">{post.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--sonic-muted)]">{post.excerpt}</p></Link>)}</div> : <p className="mt-5 text-sm text-[var(--sonic-muted)]">Không tìm thấy Social Post phù hợp.</p>}</section>
  </div></section></div>
}
