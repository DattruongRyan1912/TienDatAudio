import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import MarkdownContent from './MarkdownContent'
import ArticleMeta from './ArticleMeta'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import type { BusinessProfile } from '@/lib/business-profile'
import type { ContentPost } from '@/lib/content-types'
import type { Product } from '@/lib/data'
import { extractMarkdownHeadings } from '@/lib/markdown'
import ContentViewTracker from '@/components/analytics/ContentViewTracker'

function absoluteUrl(value: string, baseUrl: string) {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`
}

export default function PublicArticle({
  post,
  relatedPosts,
  relatedProducts,
  profile,
  preview = false,
}: {
  post: ContentPost
  relatedPosts: ContentPost[]
  relatedProducts: Product[]
  profile: BusinessProfile
  preview?: boolean
}) {
  const headings = extractMarkdownHeadings(post.bodyMarkdown)
  const publishedAt = post.publishedAt || post.scheduledAt || post.createdAt
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const articleUrl = `${baseUrl}/kien-thuc/${post.slug}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': ['Article', 'BlogPosting'],
      '@id': `${articleUrl}#article`,
      headline: post.title,
      description: post.excerpt,
      image: absoluteUrl(post.seo.ogImage || post.featuredImage || profile.logo, baseUrl),
      datePublished: publishedAt,
      dateModified: post.updatedAt,
      author: { '@type': 'Person', name: post.author },
      ...(post.reviewer ? { reviewedBy: { '@type': 'Person', name: post.reviewer } } : {}),
      publisher: { '@id': `${baseUrl}#business` },
      mainEntityOfPage: articleUrl,
      keywords: post.tags.join(', '),
      articleSection: post.category,
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Kiến thức', item: `${baseUrl}/kien-thuc` },
        { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl },
      ],
    },
  ]
  if (post.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  return <div className="sonic-page article-page pt-28 md:pt-36">
    {!preview && <ContentViewTracker type="article" id={post.id} />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }} />
    {preview && <div className="fixed inset-x-0 top-16 z-30 border-y border-amber-300/30 bg-amber-300 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#080808]">Preview admin · {post.status} · version {post.version}</div>}
    <article className={`article-container pb-20 md:pb-28 ${preview ? 'pt-12' : ''}`}>
      <SonicReveal><div className="article-flow-anchor"><Link href="/kien-thuc" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989] hover:text-[#d4af37]"><ArrowLeft size={14} /> Kiến thức</Link></div></SonicReveal>
      <SonicReveal><header className="article-flow-anchor article-header mt-10"><h1 className="article-title sonic-title">{post.title}</h1><ArticleMeta author={post.author} publishedAt={publishedAt} readingTime={post.readingTime} bodyMarkdown={post.bodyMarkdown} /><p className="article-excerpt sonic-copy mt-7 text-lg">{post.excerpt}</p></header></SonicReveal>
      {post.featuredImage && <SonicReveal direction="scale"><div className="article-flow-anchor article-media relative mt-12 aspect-[2/1] overflow-hidden border border-white/10"><Image src={post.featuredImage} alt={post.title} fill priority sizes="(min-width: 1200px) 1000px, 100vw" className="object-cover" /></div></SonicReveal>}
      <div className={`article-content-grid ${headings.length > 1 ? '' : 'article-content-grid--without-toc'}`}>
        {headings.length > 1 && <SonicReveal direction="left" className="article-toc-reveal"><aside className="article-toc"><p className="sonic-label">Trong bài viết</p><nav className="mt-4 grid gap-2 border-l border-white/10 pl-4">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`text-xs leading-5 text-[#858989] hover:text-[#d4af37] ${heading.depth === 3 ? 'pl-3' : ''}`}>{heading.text}</a>)}</nav></aside></SonicReveal>}
        <div className="article-body"><MarkdownContent markdown={post.bodyMarkdown} /><div className="article-cta mt-14 border-l-2 border-[#d4af37] pl-5 text-xl font-semibold leading-relaxed text-[#e5e2e1]">Muốn nghe rõ hơn? Hãy bắt đầu từ không gian, nhu cầu và ngân sách thật của bạn.</div><Link href={`/contact?article=${encodeURIComponent(post.id)}`} data-analytics-event="article_cta" data-post-id={post.id} className="sonic-button sonic-button-gold mt-8">Trao đổi với {profile.name} <ArrowUpRight size={15} /></Link>
          {post.gallery.length > 0 && <section className="article-gallery mt-16 grid gap-4 sm:grid-cols-2">{post.gallery.map((image) => <div key={image} className="relative aspect-[4/3] overflow-hidden border border-white/10"><Image src={image} alt={`Hình minh họa cho ${post.title}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></div>)}</section>}
          {post.faqs.length > 0 && <section className="article-faq mt-20 border-t border-white/15 pt-10"><p className="sonic-label">FAQ / Câu hỏi liên quan</p><div className="mt-6">{post.faqs.map((faq) => <details key={faq.id} className="group border-b border-white/10 py-5"><summary className="cursor-pointer list-none font-bold text-[#e5e2e1]">{faq.question}</summary><p className="mt-3 text-sm leading-7 text-[#9ea2a2]">{faq.answer}</p></details>)}</div></section>}
        </div>
      </div>
    </article>
    {relatedProducts.length > 0 && <SonicReveal><section className="border-t border-white/10 bg-[#0d0d0d] py-16"><div className="article-container"><p className="sonic-label">Thiết bị liên quan</p><div className="mt-8 grid gap-4 md:grid-cols-3">{relatedProducts.map((product) => <SonicProductCard key={product.id} product={product} />)}</div></div></section></SonicReveal>}
    {relatedPosts.length > 0 && <section className="border-t border-white/10 bg-[#0d0d0d] py-16"><div className="article-container"><p className="sonic-label">Đọc tiếp</p><div className="mt-8 grid gap-6 md:grid-cols-2">{relatedPosts.map((item) => <Link key={item.id} href={`/kien-thuc/${item.slug}`} className="group border-t border-white/15 pt-5"><p className="sonic-label text-[#858989]">{item.category}</p><h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] group-hover:text-[#d4af37]">{item.title}</h2><p className="sonic-copy mt-3 text-sm">{item.excerpt}</p></Link>)}</div></div></section>}
  </div>
}
