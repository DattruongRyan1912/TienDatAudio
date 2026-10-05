import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Check, Clock3, Headphones, MapPin, Phone } from 'lucide-react'
import SonicCatalogProductCard from '@/components/sonic/SonicCatalogProductCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import { getProducts } from '@/lib/catalog'
import { getBusinessProfile, formatPhoneDisplay, formatPhoneHref } from '@/lib/business-profile'
import { listContentPosts } from '@/lib/content-repository'
import { absoluteSiteUrl, generateSEOMetadata } from '@/lib/seo'

const pagePath = '/loa-quang-ngai'
const pageTitle = 'Loa Quảng Ngãi | Tư vấn, nghe thử — Tiến Đạt Audio'
const pageDescription = 'Tư vấn chọn loa, nghe thử, phối ghép và lắp đặt thiết bị âm thanh tại 264 Phan Đình Phùng, Chánh Lộ, Quảng Ngãi. Gọi 0934995657.'

const localFaqs = [
  {
    question: 'Tiến Đạt Audio ở đâu tại Quảng Ngãi?',
    answer: 'Tiến Đạt Audio có showroom tại 264 Phan Đình Phùng, Chánh Lộ, Quảng Ngãi, Việt Nam.',
  },
  {
    question: 'Có thể nghe thử và được tư vấn chọn loa không?',
    answer: 'Có. Bạn có thể liên hệ trước để trao đổi nhu cầu và đặt lịch nghe thử, so sánh thiết bị phù hợp với không gian và ngân sách.',
  },
  {
    question: 'Tiến Đạt Audio hỗ trợ khu vực nào?',
    answer: 'Tiến Đạt Audio phục vụ khách hàng tại Quảng Ngãi, khu vực miền Trung và các nhu cầu trao đổi từ xa trên toàn Việt Nam.',
  },
]

export const metadata: Metadata = generateSEOMetadata({
  pagePath,
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'loa Quảng Ngãi',
    'bán loa Quảng Ngãi',
    'thiết bị âm thanh Quảng Ngãi',
    'cửa hàng âm thanh Quảng Ngãi',
    'loa nghe nhạc Quảng Ngãi',
    'loa karaoke Quảng Ngãi',
    'nghe thử loa Quảng Ngãi',
  ],
})

export const revalidate = 300

function pageStructuredData(profile: Awaited<ReturnType<typeof getBusinessProfile>>, products: Awaited<ReturnType<typeof getProducts>>) {
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const pageUrl = absoluteSiteUrl(pagePath)
  const businessId = `${baseUrl}#business`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        inLanguage: 'vi-VN',
        isPartOf: { '@id': `${baseUrl}#website` },
        about: { '@id': businessId },
        areaServed: profile.areaServed,
        mainEntity: { '@id': `${pageUrl}#product-list` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Loa Quảng Ngãi', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#product-list`,
        name: 'Sản phẩm âm thanh tại Quảng Ngãi',
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            url: `${baseUrl}/san-pham/${product.slug}`,
            ...(product.images[0] ? { image: absoluteSiteUrl(product.images[0]) } : {}),
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: localFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  }
}

export default async function LocalQuangNgaiPage() {
  const [{ items: localArticles }, products, profile] = await Promise.all([
    listContentPosts({ search: 'Quảng Ngãi', limit: 6 }, true),
    getProducts({ limit: 6 }),
    getBusinessProfile(),
  ])
  const structuredData = pageStructuredData(profile, products)

  return (
    <div className="sonic-page pt-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="sonic-container pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-16">
          <div>
            <p className="sonic-label">Audio tại Quảng Ngãi / Tiến Đạt Audio</p>
            <h1 className="sonic-title mt-5 max-w-4xl">Loa Quảng Ngãi cho không gian nghe đúng chất của bạn.</h1>
            <p className="sonic-copy mt-6 max-w-2xl text-lg leading-8">Từ một đôi loa nghe nhạc đến hệ thống karaoke gia đình, lựa chọn tốt bắt đầu bằng việc hiểu căn phòng, gu nghe và cách bạn sử dụng âm thanh.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="sonic-button sonic-button-gold">Xem sản phẩm <ArrowUpRight size={16} /></Link>
              <Link href="/contact" className="sonic-button sonic-button-ghost">Đặt lịch tư vấn</Link>
            </div>
          </div>
          <div className="sonic-panel p-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-[var(--sonic-gold)]" />
              <div>
                <p className="sonic-label">Showroom Quảng Ngãi</p>
                <p className="mt-3 text-sm leading-6 text-[var(--sonic-muted)]">{profile.address.formatted}</p>
              </div>
            </div>
            <a href={formatPhoneHref(profile.phone)} className="mt-5 flex items-center gap-3 border-t border-[var(--sonic-line)] pt-5 text-sm font-bold text-[var(--sonic-gold)]">
              <Phone size={16} /> {formatPhoneDisplay(profile.phone)}
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-16 md:py-24">
        <div className="sonic-container">
          <SonicReveal>
            <div className="max-w-2xl">
              <p className="sonic-label">Tư vấn theo nhu cầu thật</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text-strong)] md:text-4xl">Một cấu hình tốt cần đúng với căn phòng.</h2>
              <p className="sonic-copy mt-5">Bạn không cần bắt đầu bằng tên thiết bị. Hãy bắt đầu bằng diện tích, thói quen nghe và điều bạn muốn cải thiện.</p>
            </div>
          </SonicReveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Chọn loa theo phòng', 'Cân nhắc diện tích, vị trí đặt và khoảng cách nghe.'],
              ['02', 'Nghe thử & so sánh', 'Trao đổi gu nhạc trước khi quyết định thiết bị.'],
              ['03', 'Phối ghép có lý do', 'Cân bằng loa, nguồn, vang số, amply và công suất.'],
              ['04', 'Lắp đặt & cân chỉnh', 'Hoàn thiện hệ thống để nghe ổn định trong thực tế.'],
            ].map(([number, title, copy], index) => (
              <SonicReveal key={number} delay={Math.min(index * 0.06, 0.18)}>
                <article className="h-full border-t border-[var(--sonic-line-strong)] pt-5">
                  <span className="sonic-label text-[var(--sonic-gold)]">{number}</span>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.03em] text-[var(--sonic-text-strong)]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--sonic-muted)]">{copy}</p>
                </article>
              </SonicReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sonic-container py-16 md:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="sonic-label">Sản phẩm / Quảng Ngãi</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text-strong)] md:text-4xl">Thiết bị để bắt đầu nghe.</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-gold)]">Xem toàn bộ catalog <ArrowUpRight size={15} /></Link>
        </div>
        {products.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <SonicReveal key={product.id} delay={Math.min(index * 0.06, 0.24)} className="h-full">
                <SonicCatalogProductCard product={product} />
              </SonicReveal>
            ))}
          </div>
        ) : (
          <div className="sonic-panel mt-10 p-8 text-sm text-[var(--sonic-muted)]">Catalog đang được cập nhật. Liên hệ để nhận danh sách thiết bị hiện có.</div>
        )}
      </section>

      <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-16 md:py-24">
        <div className="sonic-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="sonic-label">Kiến thức địa phương</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text-strong)] md:text-4xl">Đọc trước khi chọn loa.</h2>
            <p className="sonic-copy mt-5">Các bài viết Quảng Ngãi giúp bạn đi từ nhu cầu thực tế đến cấu hình dễ kiểm chứng.</p>
            <Link href="/kien-thuc" className="sonic-button sonic-button-ghost mt-7">Xem kho kiến thức <ArrowUpRight size={16} /></Link>
          </div>
          <div className="grid gap-4">
            {localArticles.length > 0 ? localArticles.map((post, index) => (
              <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group border-t border-[var(--sonic-line)] py-5 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="sonic-label">0{index + 1} / {post.category}</p>
                    <h3 className="mt-3 text-lg font-bold leading-tight tracking-[-0.03em] text-[var(--sonic-text-strong)] transition-colors group-hover:text-[var(--sonic-gold)]">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--sonic-muted)]">{post.excerpt}</p>
                  </div>
                  <ArrowUpRight size={17} className="mt-1 shrink-0 text-[var(--sonic-subtle)] transition-colors group-hover:text-[var(--sonic-gold)]" />
                </div>
              </Link>
            )) : <p className="text-sm text-[var(--sonic-muted)]">Các bài viết địa phương đang được cập nhật.</p>}
          </div>
        </div>
      </section>

      <section className="sonic-container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="sonic-label">Thông tin cần biết</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text-strong)] md:text-4xl">Tư vấn rõ ràng trước khi mua.</h2>
            <div className="mt-7 grid gap-4 text-sm text-[var(--sonic-muted)]">
              <p className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[var(--sonic-gold)]" /> Không chọn thiết bị chỉ dựa trên công suất hoặc tên thương hiệu.</p>
              <p className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[var(--sonic-gold)]" /> Giá và tồn kho được xác nhận theo từng thời điểm.</p>
              <p className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[var(--sonic-gold)]" /> Có thể trao đổi trước về phòng, gu nghe và ngân sách.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {localFaqs.map((faq) => (
              <details key={faq.question} className="group border-t border-[var(--sonic-line)] py-5 first:sm:col-span-2">
                <summary className="cursor-pointer list-none pr-6 text-lg font-bold tracking-[-0.03em] text-[var(--sonic-text-strong)] marker:hidden">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-[var(--sonic-muted)]">{faq.answer}</p>
              </details>
            ))}
            <div className="mt-3 flex items-center gap-3 border-t border-[var(--sonic-line)] pt-5 text-sm text-[var(--sonic-muted)] sm:col-span-2">
              <Clock3 size={17} className="text-[var(--sonic-gold)]" />
              <span>{profile.businessHours.join(' / ')}</span>
              <Headphones size={17} className="ml-auto text-[var(--sonic-gold)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="sonic-container pb-20 md:pb-28">
        <div className="sonic-panel flex flex-col items-start justify-between gap-7 p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="sonic-label">Bắt đầu tại Quảng Ngãi</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-[-0.04em] text-[var(--sonic-text-strong)] md:text-3xl">Gửi diện tích phòng và nhu cầu, chúng tôi sẽ cùng bạn tìm điểm bắt đầu hợp lý.</h2>
          </div>
          <Link href="/contact" className="sonic-button sonic-button-gold shrink-0">Nhận tư vấn <ArrowUpRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
