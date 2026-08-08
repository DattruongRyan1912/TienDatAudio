import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPosts } from '@/lib/catalog'

type ArticlePageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  return { title: post ? `${post.title} — Tiến Đạt Audio` : 'Không tìm thấy bài viết' }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || !post.published) notFound()
  const related = (await getPosts()).filter((item) => item.id !== post.id).slice(0, 2)
  return (
    <div className="sonic-page pt-28 md:pt-36">
      <article className="sonic-container max-w-5xl pb-20 md:pb-28"><Link href="/kien-thuc" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989] hover:text-[#d4af37]"><ArrowLeft size={14} /> Kiến thức</Link><header className="mt-10 max-w-4xl"><p className="sonic-label">{post.category} / {post.readingTime || 5} phút đọc</p><h1 className="sonic-title mt-5">{post.title}</h1><p className="sonic-copy mt-6 max-w-2xl text-lg">{post.excerpt}</p><p className="mt-7 text-xs text-[#707474]">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(post.publishedAt))} · {post.author}</p></header><div className="relative mt-12 aspect-[2/1] overflow-hidden border border-white/10"><Image src={post.featuredImage || '/images/sonic-hero.png'} alt={post.title} fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#080808]/45 to-transparent" /></div><div className="mx-auto mt-12 max-w-2xl whitespace-pre-line text-base leading-8 text-[#c4c7c7] md:text-lg">{post.content}</div><div className="mx-auto mt-12 max-w-2xl border-l-2 border-[#d4af37] pl-5 text-xl font-semibold leading-relaxed text-[#e5e2e1]">Muốn nghe rõ hơn? Hãy bắt đầu từ không gian và nhu cầu thật của bạn.</div><div className="mx-auto mt-10 max-w-2xl"><Link href="/contact" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#d4af37]">Trao đổi với Tiến Đạt Audio <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></article>
      {related.length > 0 && <section className="border-t border-white/10 bg-[#0d0d0d] py-16"><div className="sonic-container"><p className="sonic-label">Đọc tiếp</p><div className="mt-8 grid gap-6 md:grid-cols-2">{related.map((item) => <Link key={item.id} href={`/kien-thuc/${item.slug}`} className="group border-t border-white/15 pt-5"><p className="sonic-label text-[#858989]">{item.category}</p><h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] group-hover:text-[#d4af37]">{item.title}</h2><p className="sonic-copy mt-3 text-sm">{item.excerpt}</p></Link>)}</div></div></section>}
    </div>
  )
}

