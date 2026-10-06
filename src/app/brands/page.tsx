import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import SonicBrandCard from '@/components/sonic/SonicBrandCard'
import { getBrands, getProducts } from '@/lib/catalog'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/brands',
  title: 'Thương hiệu âm thanh chính hãng — Tiến Đạt Audio',
  description:
    'Danh sách các thương hiệu thiết bị âm thanh hàng đầu thế giới được Tiến Đạt Audio phân phối chính hãng và bảo hành uy tín tại Quảng Ngãi: JBL, Bose, BMB, Yamaha, Denon, Paramax...',
  keywords: [
    'thương hiệu âm thanh',
    'đại lý loa JBL Quảng Ngãi',
    'bose chính hãng Quảng Ngãi',
    'loa bmb chính hãng',
    'Tiến Đạt Audio',
  ],
})

type BrandsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type BrandSort = 'all' | 'az' | 'country'

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeSort(value: string | undefined): BrandSort {
  return value === 'az' || value === 'country' ? value : 'all'
}

function getProductCount(
  brand: { id: string; name: string; productCount?: number },
  products: Awaited<ReturnType<typeof getProducts>>
) {
  if (typeof brand.productCount === 'number') return brand.productCount
  return products.filter((product) => product.brand_id === brand.id || product.brand === brand.name).length
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const [params, brands, products, profile] = await Promise.all([
    searchParams,
    getBrands(),
    getProducts(),
    getBusinessProfile(),
  ])

  const sort = normalizeSort(first(params.sort))
  const phoneHref = formatPhoneHref(profile.phone)

  const productCounts = new Map(brands.map((brand) => [brand.id, getProductCount(brand, products)]))
  const curatedProductCount = Array.from(productCounts.values()).reduce((total, count) => total + count, 0)
  const originCount = new Set(brands.map((brand) => brand.country).filter(Boolean)).size
  const featuredBrandId = brands.find((brand) => brand.featured)?.id || brands[0]?.id

  const sortedBrands = [...brands].sort((a, b) => {
    if (sort === 'az') return a.name.localeCompare(b.name)
    if (sort === 'country')
      return (
        (a.country || 'International').localeCompare(b.country || 'International') ||
        a.name.localeCompare(b.name)
      )
    return (
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      (a.sortOrder || 0) - (b.sortOrder || 0) ||
      a.name.localeCompare(b.name)
    )
  })

  const sortHref = (value: BrandSort) => (value === 'all' ? '/brands' : `/brands?sort=${value}`)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Thương hiệu đối tác</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
              <ShieldCheck size={14} /> 100% Chính Hãng — Đầy Đủ CO/CQ
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Thương Hiệu Âm Thanh Tuyển Chọn
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Tiến Đạt Audio là đại lý phân phối chính hãng các thương hiệu âm thanh nổi tiếng toàn cầu. Mỗi sản phẩm được bảo hành minh bạch, hỗ trợ kỹ thuật và cân chỉnh chuyên sâu tại Quảng Ngãi.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:gap-6">
            <div className="text-center px-2">
              <span className="block text-2xl font-extrabold text-[#d32f2f] sm:text-3xl">
                {brands.length}
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-500">Thương hiệu</span>
            </div>
            <div className="h-10 w-px bg-slate-200 my-auto" />
            <div className="text-center px-2">
              <span className="block text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {curatedProductCount}+
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-500">Thiết bị</span>
            </div>
            <div className="h-10 w-px bg-slate-200 my-auto" />
            <div className="text-center px-2">
              <span className="block text-2xl font-extrabold text-[#0068ff] sm:text-3xl">
                {originCount}
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-500">Quốc gia</span>
            </div>
          </div>
        </div>

        {/* Sort & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 border-y border-slate-200/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sắp xếp:
            </span>
            <div className="flex gap-2">
              {(
                [
                  ['all', 'Nổi bật'],
                  ['az', 'Tên A — Z'],
                  ['country', 'Theo Quốc gia'],
                ] as const
              ).map(([value, label]) => {
                const active = sort === value
                return (
                  <Link
                    key={value}
                    href={sortHref(value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#d32f2f] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Hiển thị <strong>{sortedBrands.length}</strong> thương hiệu đang có sản phẩm tại Showroom
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBrands.map((brand, index) => (
            <SonicBrandCard
              key={brand.id}
              brand={brand}
              index={index}
              productCount={productCounts.get(brand.id) || 0}
              featured={index === 0 && sort === 'all' && brand.id === featuredBrandId}
            />
          ))}
        </div>

        {/* Bottom Consultation Banner */}
        <div className="mt-16 rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
                <Sparkles size={14} /> Tư vấn chuyên gia
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Bạn chưa biết thương hiệu nào phù hợp với diện tích phòng và ngân sách?
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Đừng ngần ngại! Hãy liên hệ ngay với kỹ thuật viên của Tiến Đạt Audio để được so sánh trực tiếp các mẫu loa JBL, Bose, BMB, Paramax... trước khi quyết định mua.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#b71c1c]"
              >
                <Phone size={16} />
                Hotline: {profile.phone}
              </a>
              <a
                href="https://zalo.me/0934995657"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0068ff] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#0052cc]"
              >
                <MessageCircle size={16} />
                Chat Zalo Báo Giá
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
