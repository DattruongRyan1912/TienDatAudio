import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import SonicBrandCard from '@/components/sonic/SonicBrandCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import { getBrands, getProducts } from '@/lib/catalog'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/brands',
  title: 'Thương hiệu — Tiến Đạt Audio',
  description: 'Các thương hiệu thiết bị âm thanh được Tiến Đạt Audio tuyển chọn và tư vấn theo không gian nghe thực tế.',
})

type BrandsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }
type BrandSort = 'all' | 'az' | 'country'

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeSort(value: string | undefined): BrandSort {
  return value === 'az' || value === 'country' ? value : 'all'
}

function getProductCount(brand: { id: string; name: string; productCount?: number }, products: Awaited<ReturnType<typeof getProducts>>) {
  if (typeof brand.productCount === 'number') return brand.productCount
  return products.filter((product) => product.brand_id === brand.id || product.brand === brand.name).length
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams
  const sort = normalizeSort(first(params.sort))
  const [brands, products] = await Promise.all([getBrands(), getProducts()])
  const productCounts = new Map(brands.map((brand) => [brand.id, getProductCount(brand, products)]))
  const curatedProductCount = Array.from(productCounts.values()).reduce((total, count) => total + count, 0)
  const originCount = new Set(brands.map((brand) => brand.country).filter(Boolean)).size
  const featuredBrandId = brands.find((brand) => brand.featured)?.id || brands[0]?.id
  const sortedBrands = [...brands].sort((a, b) => {
    if (sort === 'az') return a.name.localeCompare(b.name)
    if (sort === 'country') return (a.country || 'International').localeCompare(b.country || 'International') || a.name.localeCompare(b.name)
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name)
  })
  const sortHref = (value: BrandSort) => value === 'all' ? '/brands' : `/brands?sort=${value}`

  return (
    <div className="sonic-page pt-28 md:pt-36">
      <section className="sonic-container max-w-[1360px] border-b border-[var(--sonic-line)] pb-20 md:pb-28">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_260px] md:items-end md:gap-20">
          <SonicReveal direction="left">
            <p className="sonic-label">Brands / Selected partners</p>
            <h1 className="sonic-title mt-5 max-w-[720px]">Những cái tên tạo nên<br className="hidden md:block" /> ngôn ngữ âm thanh riêng.</h1>
            <p className="sonic-copy mt-7 max-w-[480px]">Chúng tôi không chọn thương hiệu vì danh tiếng đơn thuần. Mỗi cái tên cần có một lý do để hiện diện trong hệ thống của bạn.</p>
          </SonicReveal>

          <SonicReveal direction="right" delay={0.12}>
            <div className="border-t border-[var(--sonic-line-strong)]">
              {[
                [String(brands.length).padStart(2, '0'), 'Selected brands'],
                [String(curatedProductCount).padStart(2, '0'), 'Curated products'],
                [String(originCount).padStart(2, '0'), 'Audio origins'],
              ].map(([value, label]) => (
                <div key={label} className="flex items-end justify-between gap-4 border-b border-[var(--sonic-line)] py-4">
                  <span className="text-3xl font-semibold tracking-[-0.06em] text-[var(--sonic-text-strong)]">{value}</span>
                  <span className="sonic-label mb-1 text-right text-[var(--sonic-subtle)]">{label}</span>
                </div>
              ))}
            </div>
          </SonicReveal>
        </div>
      </section>

      <section className="border-b border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-20 md:py-28">
        <div className="sonic-container max-w-[1360px]">
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end md:gap-16">
            <div>
              <p className="sonic-label">01 / Partner library</p>
              <h2 className="sonic-title mt-5 max-w-xl">Từ sân khấu<br className="hidden md:block" /> đến phòng nghe tại gia.</h2>
            </div>
            <p className="sonic-copy max-w-xl md:justify-self-end">Mỗi thương hiệu được chọn vì một triết lý âm thanh, khả năng phối ghép và vai trò riêng trong hệ thống.</p>
          </div>

          <div className="mt-12 flex items-center gap-5 overflow-x-auto border-y border-[var(--sonic-line)] py-4" aria-label="Sắp xếp thương hiệu">
            <span className="sonic-label shrink-0 text-[var(--sonic-subtle)]">Brand index</span>
            <nav className="flex min-w-max items-center gap-6" aria-label="Bộ lọc thương hiệu">
              {([
                ['all', 'Tất cả'],
                ['az', 'A — Z'],
                ['country', 'Quốc gia'],
              ] as const).map(([value, label]) => {
                const active = sort === value
                return <Link key={value} href={sortHref(value)} aria-current={active ? 'page' : undefined} className={`sonic-editorial-filter ${active ? 'sonic-editorial-filter-active' : ''}`}>{label}</Link>
              })}
            </nav>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sortedBrands.map((brand, index) => (
              <SonicReveal key={brand.id} className={index === 0 && sort === 'all' && brand.id === featuredBrandId ? 'md:col-span-2' : ''} delay={index * 0.06}>
                <SonicBrandCard brand={brand} index={index} productCount={productCounts.get(brand.id) || 0} featured={index === 0 && sort === 'all' && brand.id === featuredBrandId} />
              </SonicReveal>
            ))}
          </div>

          <div className="mt-28 flex items-center gap-4 md:mt-40" aria-hidden="true">
            <span className="sonic-label shrink-0 text-[var(--sonic-subtle)]">Selected for listening</span>
            <span className="h-px flex-1 bg-[var(--sonic-line)]" />
            <span className="h-px w-16 bg-[var(--sonic-gold)] opacity-40" />
          </div>
        </div>
      </section>

      <section className="sonic-container max-w-[1360px] py-20 md:py-32">
        <div className="mb-14 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-[var(--sonic-line)]" />
          <span className="h-px w-24 bg-[var(--sonic-line-strong)]" />
        </div>
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-end md:gap-20">
          <SonicReveal direction="left">
            <p className="sonic-label">02 / Phối ghép</p>
            <h2 className="sonic-title mt-5 max-w-xl">Một logo<br className="hidden md:block" /> không nói lên tất cả.</h2>
          </SonicReveal>
          <SonicReveal direction="right" delay={0.1}>
            <p className="sonic-copy max-w-2xl">Thương hiệu chỉ là điểm khởi đầu. Khả năng phối ghép, căn chỉnh và cách hệ thống phản hồi trong chính không gian của bạn mới là điều chúng tôi quan tâm.</p>
            <Link href="/contact" className="sonic-editorial-cta group mt-8 inline-flex items-center gap-2">Nói chuyện với chuyên gia <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
          </SonicReveal>
        </div>
      </section>
    </div>
  )
}
