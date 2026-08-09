import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Rss, Search } from 'lucide-react'
import { getPublicPosts } from '@/lib/content-repository'

export const metadata: Metadata = {
  title: 'Kiến thức âm thanh — Tiến Đạt Audio',
  description: 'Góc nhìn thực tế về thiết bị, phối ghép và không gian âm thanh.',
  alternates: { canonical: '/kien-thuc', types: { 'application/rss+xml': '/feed.xml' } },
}
export const revalidate = 300

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [posts, params] = await Promise.all([getPublicPosts(200), searchParams])
  const query = String(params.q || '').trim().toLocaleLowerCase('vi')
  const filtered = query ? posts.filter((post) => [post.title, post.excerpt, post.category, ...post.tags].join(' ').toLocaleLowerCase('vi').includes(query)) : posts
  const [featured, ...rest] = filtered

  return <div className="sonic-page pt-28 md:pt-36">
    <section className="sonic-container pb-14 md:pb-20"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="sonic-label">Journal / Audio culture</p><h1 className="sonic-title mt-5 max-w-4xl">Kiến thức để nghe sâu hơn.</h1><p className="sonic-copy mt-6 max-w-xl">Các bài viết có tác giả, người duyệt, nguồn nội bộ và ngày cập nhật rõ ràng — tập trung vào cách âm thanh hoạt động trong không gian thật.</p></div><div className="w-full md:max-w-sm"><form action="/kien-thuc" className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858989]" /><input name="q" defaultValue={params.q || ''} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm bài viết..." aria-label="Tìm bài viết" /></form><Link href="/feed.xml" className="mt-3 inline-flex items-center gap-2 text-xs text-[#858989] hover:text-[#d4af37]"><Rss size={13} /> Theo dõi RSS</Link></div></div></section>

    {!featured ? <section className="border-y border-white/10 bg-[#0d0d0d] py-20"><div className="sonic-container"><p className="text-sm text-[#858989]">Không tìm thấy bài viết phù hợp với “{params.q}”.</p><Link href="/kien-thuc" className="sonic-button sonic-button-ghost mt-6">Xóa bộ lọc</Link></div></section> : <>
      <section className="border-y border-white/10 bg-[#0d0d0d] py-12 md:py-16"><div className="sonic-container grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-16"><Link href={`/kien-thuc/${featured.slug}`} className="group relative aspect-[1.45] overflow-hidden border border-white/10"><Image src={featured.featuredImage || '/images/sonic-hero.png'} alt={featured.title} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" /><span className="absolute left-5 top-5 sonic-label bg-[#d4af37] px-2 py-1 text-[#080808]">Featured story</span><div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-5"><h2 className="max-w-xl text-2xl font-bold tracking-[-0.04em] text-[#e5e2e1] md:text-4xl">{featured.title}</h2><ArrowUpRight size={22} className="shrink-0 text-[#d4af37]" /></div></Link><div><p className="sonic-label">{featured.category} / {featured.readingTime} phút đọc</p><p className="mt-6 text-xl leading-relaxed text-[#c4c7c7]">{featured.excerpt}</p><p className="mt-4 text-xs text-[#707474]">{featured.author} · cập nhật {new Date(featured.updatedAt).toLocaleDateString('vi-VN')}</p><Link href={`/kien-thuc/${featured.slug}`} className="sonic-button sonic-button-ghost mt-8">Đọc bài viết <ArrowUpRight size={16} /></Link></div></div></section>
      <section className="sonic-container py-16 md:py-24"><div className="flex items-end justify-between"><div><p className="sonic-label">Archive / Latest notes</p><h2 className="sonic-title mt-4">Góc nhìn mới nhất.</h2></div><span className="sonic-label hidden text-[#858989] sm:block">{rest.length.toString().padStart(2, '0')} bài viết</span></div><div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">{rest.map((post, index) => <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group grid gap-5 border-t border-white/15 pt-5 sm:grid-cols-[.85fr_1.15fr]"><div className="relative aspect-[1.15] overflow-hidden bg-[#111111]"><Image src={post.featuredImage || '/images/sonic-hero.png'} alt={post.title} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100" /></div><div><div className="flex items-center justify-between"><span className="sonic-label text-[#858989]">{String(index + 2).padStart(2, '0')} / {post.category}</span><ArrowUpRight size={15} className="text-[#858989] transition-colors group-hover:text-[#d4af37]" /></div><h3 className="mt-5 text-xl font-bold leading-tight tracking-[-0.03em] text-[#e5e2e1] transition-colors group-hover:text-[#d4af37]">{post.title}</h3><p className="mt-3 text-sm leading-6 text-[#9ea2a2]">{post.excerpt}</p><p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#707474]">{post.readingTime} phút đọc · {post.author}</p></div></Link>)}</div></section>
    </>}
  </div>
}
