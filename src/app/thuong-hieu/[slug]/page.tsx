import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getBrandBySlug, getBrands, getProducts } from '@/lib/catalog'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { absoluteSiteUrl, generateSEOMetadata } from '@/lib/seo'

type BrandDetailPageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({ params }: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Thương hiệu không tồn tại — Tiến Đạt Audio' }
  return generateSEOMetadata({
    title: `${brand.name} — Thương hiệu âm thanh chính hãng | Tiến Đạt Audio`,
    description:
      brand.description ||
      `Khám phá các thiết bị âm thanh ${brand.name} chính hãng được phân phối và bảo hành tại Tiến Đạt Audio Quảng Ngãi.`,
    image: brand.logo,
    url: `/thuong-hieu/${brand.slug}`,
  })
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { slug } = await params
  const [brand, profile] = await Promise.all([getBrandBySlug(slug), getBusinessProfile()])
  if (!brand) notFound()

  const products = await getProducts({ brand: brand.id })
  const productCount = typeof brand.productCount === 'number' ? brand.productCount : products.length
  const canonicalUrl = absoluteSiteUrl(`/thuong-hieu/${brand.slug}`)
  const phoneHref = formatPhoneHref(profile.phone)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        '@id': `${canonicalUrl}#brand`,
        name: brand.name,
        description: brand.description,
        logo: absoluteSiteUrl(brand.logo),
        url: canonicalUrl,
        ...(brand.website ? { sameAs: [brand.website] } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: absoluteSiteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Thương hiệu', item: absoluteSiteUrl('/brands') },
          { '@type': 'ListItem', position: 3, name: brand.name, item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link href="/brands" className="hover:text-[#d32f2f] transition-colors">
            Thương hiệu
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">{brand.name}</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#d32f2f] transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách thương hiệu
          </Link>
        </div>

        {/* Brand Header Banner */}
        <div className="mb-10 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
                  Chính hãng {brand.name}
                </span>
                {brand.country && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Globe size={12} /> Xuất xứ: {brand.country}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} /> Bảo hành chính hãng
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Thiết Bị Âm Thanh {brand.name}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {brand.description ||
                  `Khám phá toàn bộ danh mục sản phẩm của ${brand.name} được kiểm định chất lượng, phối ghép chuẩn âm học và phân phối trực tiếp tại Showroom Tiến Đạt Audio Quảng Ngãi.`}
              </p>
            </div>

            {/* Metrics Box */}
            <div className="shrink-0 rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center">
              <p className="text-3xl font-extrabold text-[#d32f2f] md:text-4xl">
                {String(productCount).padStart(2, '0')}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                Sản phẩm phân phối
              </p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Danh mục thiết bị {brand.name}
            </h2>
            <p className="text-xs text-slate-500">
              Có {products.length} sản phẩm sẵn sàng nghe thử tại showroom
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <SonicProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#d32f2f]">
              <Sparkles size={28} />
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Danh mục {brand.name} đang được cập nhật
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Sản phẩm {brand.name} có sẵn tại showroom nhưng chưa kịp đưa lên website. Quý khách vui lòng liên hệ hotline để nhận catalog và báo giá tức thì.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#b71c1c]"
              >
                <Phone size={14} />
                Gọi tư vấn: {profile.phone}
              </a>
              <a
                href={`https://zalo.me/0934995657?text=${encodeURIComponent(`Tôi muốn nhận báo giá sản phẩm ${brand.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0052cc]"
              >
                <MessageCircle size={14} />
                Chat Zalo nhận báo giá
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
