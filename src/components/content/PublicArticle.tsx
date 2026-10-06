import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import MarkdownContent from './MarkdownContent'
import ArticleMeta from './ArticleMeta'
import ArticleHashNavigation from './ArticleHashNavigation'
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
    <ArticleHashNavigation />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }} />
    {preview && <div className="fixed inset-x-0 top-16 z-30 border-y border-amber-300/30 bg-amber-300 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#080808]">Preview admin · {post.status} · version {post.version}</div>}
    <article className={`article-container pb-20 md:pb-28 ${preview ? 'pt-12' : ''}`}>
      <SonicReveal><div className="article-flow-anchor"><Link href="/kien-thuc" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#d32f2f] transition-colors"><ArrowLeft size={14} /> Quay lại chuyên mục Kiến thức</Link></div></SonicReveal>
      <SonicReveal><header className="article-flow-anchor article-header mt-8"><h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">{post.title}</h1><ArticleMeta author={post.author} publishedAt={publishedAt} readingTime={post.readingTime} bodyMarkdown={post.bodyMarkdown} /><p className="mt-6 text-base leading-relaxed text-slate-600 md:text-lg">{post.excerpt}</p></header></SonicReveal>
      {post.featuredImage && <SonicReveal direction="scale"><div className="article-flow-anchor article-media relative mt-10 aspect-[2/1] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"><Image src={post.featuredImage} alt={post.title} fill priority sizes="(min-width: 1200px) 1000px, 100vw" className="object-cover" /></div></SonicReveal>}
      <div className={`article-content-grid ${headings.length > 1 ? '' : 'article-content-grid--without-toc'} mt-10`}>
        {headings.length > 1 && <div className="article-toc-reveal"><aside className="article-toc rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mục lục bài viết</p><nav className="mt-4 grid gap-2 border-l-2 border-slate-200 pl-3">{headings.map((heading) => <a key={heading.id} href={`#user-content-${heading.id}`} className={`text-xs leading-5 text-slate-600 hover:text-[#d32f2f] transition-colors ${heading.depth === 3 ? 'pl-2' : 'font-medium'}`}>{heading.text}</a>)}</nav></aside></div>}
        <div className="article-body">
          <MarkdownContent markdown={post.bodyMarkdown} />
          <div className="mt-14 rounded-2xl border border-red-200 bg-red-50/70 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">Cần tư vấn trực tiếp theo không gian của bạn?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">Đội ngũ kỹ thuật của Tiến Đạt Audio luôn sẵn sàng khảo sát, đo đạc và tư vấn cấu hình phối ghép chuẩn mực nhất cho phòng của bạn.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/contact?article=${encodeURIComponent(post.id)}`} data-analytics-event="article_cta" data-post-id={post.id} className="inline-flex items-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#b71c1c]">Đặt lịch nghe thử showroom <ArrowUpRight size={15} /></Link>
              <a href="https://zalo.me/0934995657" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#0052cc]">Chat Zalo tư vấn</a>
            </div>
          </div>
          {post.gallery.length > 0 && <section className="article-gallery mt-14 grid gap-4 sm:grid-cols-2">{post.gallery.map((image) => <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm"><Image src={image} alt={`Hình minh họa cho ${post.title}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></div>)}</section>}
          {post.faqs.length > 0 && <section className="article-faq mt-14 border-t border-slate-200 pt-8"><p className="text-xs font-bold uppercase tracking-wider text-[#d32f2f]">Hỏi đáp liên quan</p><div className="mt-4 space-y-3">{post.faqs.map((faq) => <details key={faq.id} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs open:ring-1 open:ring-red-200"><summary className="cursor-pointer list-none font-bold text-slate-900 group-hover:text-[#d32f2f] transition-colors">{faq.question}</summary><p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p></details>)}</div></section>}
        </div>
      </div>
    </article>
    {relatedProducts.length > 0 && <SonicReveal><section className="border-t border-slate-200 bg-white py-14 md:py-16"><div className="article-container"><p className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">Thiết bị liên quan</p><div className="mt-6 grid gap-5 md:grid-cols-3">{relatedProducts.map((product) => <SonicProductCard key={product.id} product={product} />)}</div></div></section></SonicReveal>}
    {relatedPosts.length > 0 && <section className="border-t border-slate-200 bg-[#f8fafc] py-14 md:py-16"><div className="article-container"><p className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">Đọc tiếp</p><div className="mt-6 grid gap-6 md:grid-cols-2">{relatedPosts.map((item) => <Link key={item.id} href={`/kien-thuc/${item.slug}`} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-red-200 hover:shadow-md"><p className="text-[11px] font-bold uppercase text-[#d32f2f]">{item.category}</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#d32f2f]">{item.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.excerpt}</p></Link>)}</div></div></section>}
  </div>
}
