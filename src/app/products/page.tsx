import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react'
import SonicCatalogFeaturedCard from '@/components/sonic/SonicCatalogFeaturedCard'
import SonicCatalogProductCard from '@/components/sonic/SonicCatalogProductCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import { getBrands, getCategories, getProducts } from '@/lib/catalog'
import { generateSEOMetadata } from '@/lib/seo'

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }
type QueryOverrides = Partial<{ search: string; category: string; brand: string; sort: string; page: number }>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const categoryParam = first(params.category)
  const brandParam = first(params.brand)
  const searchParam = first(params.search)
  const [categories, brands] = await Promise.all([getCategories(), getBrands()])
  const activeCategory = categories.find((item) => item.id === categoryParam || item.slug === categoryParam)
  const activeBrand = brands.find((item) => item.id === brandParam || item.slug === brandParam)

  let title = 'Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi — Tiến Đạt Audio'
  let description = 'Cung cấp loa thùng, vang số chống hú, main công suất, amply karaoke chính hãng tại Quảng Ngãi. Trải nghiệm nghe thử âm thanh tại 264 Phan Đình Phùng. Hotline: 0934 995 657.'

  if (activeCategory) {
    title = `${activeCategory.name} Chính Hãng Tại Quảng Ngãi — Tiến Đạt Audio`
    description = `Tuyển chọn các dòng ${activeCategory.name.toLowerCase()} cao cấp tại Tiến Đạt Audio Quảng Ngãi. Tư vấn phối ghép chuẩn âm học, lắp đặt tận nơi.`
  } else if (activeBrand) {
    title = `Thiết Bị Âm Thanh ${activeBrand.name} Chính Hãng — Tiến Đạt Audio Quảng Ngãi`
    description = `Phân phối thiết bị âm thanh thương hiệu ${activeBrand.name} chính hãng tại Quảng Ngãi. Bảo hành uy tín, hỗ trợ kỹ thuật tận nhà.`
  } else if (searchParam) {
    title = `Tìm kiếm: ${searchParam} — Thiết Bị Âm Thanh Tiến Đạt Audio`
    description = `Kết quả tìm kiếm thiết bị âm thanh ${searchParam} tại Tiến Đạt Audio Quảng Ngãi.`
  }

  return generateSEOMetadata({
    pagePath: '/products',
    title,
    description,
    keywords: [
      activeCategory ? `${activeCategory.name} Quảng Ngãi` : 'thiết bị âm thanh Quảng Ngãi',
      'dàn karaoke Quảng Ngãi',
      'loa Quảng Ngãi',
      'vang số Quảng Ngãi',
      'cục đẩy công suất Quảng Ngãi',
      'Tiến Đạt Audio',
    ],
  })
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const search = first(params.search) || ''
  const category = first(params.category) || ''
  const brand = first(params.brand) || ''
  const sort = first(params.sort) || 'featured'
  const requestedPage = Number.parseInt(first(params.page) || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const [products, categories, brands] = await Promise.all([
    getProducts({ search: search || undefined, category: category || undefined, brand: brand || undefined }),
    getCategories(),
    getBrands(),
  ])

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price-asc') return (a.salePrice || a.price) - (b.salePrice || b.price)
    if (sort === 'price-desc') return (b.salePrice || b.price) - (a.salePrice || a.price)
    if (sort === 'name') return a.name.localeCompare(b.name)
    return Number(b.featured) - Number(a.featured) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const activeCategory = categories.find((item) => item.id === category || item.slug === category)
  const activeBrand = brands.find((item) => item.id === brand || item.slug === brand)

  const categoryHeadingMap: Record<string, { h1: string; subtitle: string }> = {
    'loa-thung': {
      h1: 'Loa Thùng & Loa Full Karaoke Chính Hãng',
      subtitle: 'Các dòng loa full bass 25, bass 30 uy lực, dải âm sáng rõ, cho lời ca bay bổng phục vụ karaoke gia đình và sự kiện tại Quảng Ngãi.',
    },
    'loa-tram': {
      h1: 'Loa Trầm Subwoofer Uy Lực Cho Dàn Karaoke',
      subtitle: 'Tăng cường dải trầm sâu chắc, mạnh mẽ, mang lại trải nghiệm âm thanh sống động cho phòng hát tại gia và không gian giải trí.',
    },
    'vang-so': {
      h1: 'Vang Số Chống Hú Rít Chuyên Nghiệp',
      subtitle: 'Xử lý âm thanh kỹ thuật số DSP cao cấp, cắt triệt để tiếng hú rít micro, nâng tầm giọng hát mượt mà và nhẹ hơi.',
    },
    'main-cong-suat': {
      h1: 'Cục Đẩy Công Suất Nhập Khẩu Chính Hãng',
      subtitle: 'Cung cấp nguồn năng lượng dồi dào, đánh căng các dòng loa công suất lớn với độ bền bỉ và độ ổn định cao.',
    },
    'amply-karaoke': {
      h1: 'Amply Karaoke Gia Đình Cao Cấp',
      subtitle: 'Amply tích hợp vang số thế hệ mới, dễ dàng căn chỉnh, đáp ứng hoàn hảo nhu cầu nghe nhạc và hát karaoke gia đình.',
    },
  }

  const categoryPreset = activeCategory?.slug ? categoryHeadingMap[activeCategory.slug] : null
  const dynamicH1 = categoryPreset?.h1
    || (activeCategory ? `${activeCategory.name} Chính Hãng Tại Quảng Ngãi` : null)
    || (activeBrand ? `Thiết Bị Âm Thanh Thương Hiệu ${activeBrand.name}` : null)
    || (search ? `Kết quả tìm kiếm cho “${search}”` : 'Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi')

  const dynamicSubtitle = categoryPreset?.subtitle
    || (activeCategory ? `Bộ sưu tập ${activeCategory.name.toLowerCase()} tuyển chọn tại Tiến Đạt Audio Quảng Ngãi. Trải nghiệm nghe thử âm thanh trực tiếp tại 264 Phan Đình Phùng.` : null)
    || (activeBrand ? `Các thiết bị âm thanh ${activeBrand.name} chính hãng phân phối tại Quảng Ngãi với chính sách bảo hành uy tín và lắp đặt tận nơi.` : null)
    || 'Khám phá bộ sưu tập loa, vang số, main công suất và dàn karaoke chính hãng. Phối ghép chuẩn âm học, trải nghiệm nghe thử thực tế tại 264 Phan Đình Phùng, TP Quảng Ngãi.'

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tiendataudioquangngai.id.vn').replace(/\/$/, '')
  const catalogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dynamicH1,
    description: dynamicSubtitle,
    url: `${siteUrl}/products`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: sortedProducts.length,
      itemListElement: sortedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/san-pham/${product.slug}`,
        name: product.name,
        image: product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${siteUrl}${product.images[0]}`) : undefined,
      })),
    },
  }

  const featuredProduct = sort === 'featured' ? sortedProducts.find((item) => item.featured) || sortedProducts[0] : null
  const catalogProducts = featuredProduct ? sortedProducts.filter((item) => item.id !== featuredProduct.id) : sortedProducts
  const pageSize = 6
  const pageCount = Math.max(1, Math.ceil(catalogProducts.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = catalogProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const hrefFor = (overrides: QueryOverrides = {}) => {
    const next = new URLSearchParams()
    const values = { search, category, brand, sort, page: currentPage, ...overrides }
    if (values.search) next.set('search', values.search)
    if (values.category) next.set('category', values.category)
    if (values.brand) next.set('brand', values.brand)
    if (values.sort !== 'featured') next.set('sort', values.sort)
    if (values.page > 1) next.set('page', String(values.page))
    const query = next.toString()
    return query ? `/products?${query}` : '/products'
  }

  return (
    <div className="sonic-page pt-28 md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogStructuredData) }}
      />
      <section className="sonic-container pb-14 md:pb-20">
        <SonicReveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="sonic-label">{activeCategory ? `Danh mục / ${activeCategory.name}` : 'Danh mục sản phẩm'}</p>
            <h1 className="sonic-title mt-5 max-w-3xl">{dynamicH1}</h1>
            <p className="sonic-copy mt-5 max-w-xl">
              {dynamicSubtitle}
            </p>
            <Link href="/loa-quang-ngai" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-gold)] transition-colors hover:text-[var(--sonic-gold-hover)]">Tìm loa và tư vấn tại Quảng Ngãi <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="text-left md:text-right">
            <p className="text-4xl font-bold tracking-[-0.05em] text-[var(--sonic-gold)]">{sortedProducts.length.toString().padStart(2, '0')}</p>
            <p className="sonic-label mt-2 text-[var(--sonic-subtle)]">Sản phẩm trong catalog</p>
          </div>
        </SonicReveal>
      </section>

      <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface)]">
        <div className="sonic-container py-7">
          <form action="/products" className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sonic-subtle)]" />
              <input name="search" defaultValue={search} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm kiếm thiết bị, thương hiệu..." />
            </div>
            {category && <input type="hidden" name="category" value={category} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            <button type="submit" className="sonic-button sonic-button-gold">Tìm kiếm</button>
          </form>
        </div>
      </section>

      <section className="sonic-container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <aside className="sonic-panel h-fit p-5 lg:sticky lg:top-32 md:p-6">
            <div className="flex items-center justify-between border-b border-[var(--sonic-line)] pb-4">
              <p className="sonic-label">Bộ lọc</p>
              <SlidersHorizontal size={16} className="text-[var(--sonic-gold)]" />
            </div>

            {(activeCategory || activeBrand || search) && (
              <div className="flex flex-wrap gap-2 border-b border-[var(--sonic-line)] py-4">
                <span className="w-full text-xs text-[var(--sonic-subtle)]">Đang chọn:</span>
                {[activeCategory?.name, activeBrand?.name, search && `“${search}”`].filter(Boolean).map((item) => (
                  <span key={item as string} className="border border-[var(--sonic-gold)]/50 px-2 py-1 text-[0.62rem] text-[var(--sonic-gold)]">
                    {item}
                  </span>
                ))}
                <Link href="/products" className="ml-auto text-[0.62rem] uppercase tracking-wider text-[var(--sonic-subtle)] hover:text-[var(--sonic-gold)]">Xóa</Link>
              </div>
            )}

            <div className="border-b border-[var(--sonic-line)] py-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-text)]">Danh mục</p>
              <div className="grid gap-1">
                {categories.map((item) => {
                  const active = category === item.id || category === item.slug
                  return (
                    <Link key={item.id} href={hrefFor({ category: item.id, page: 1 })} className={`flex items-center justify-between py-2 text-sm transition-colors hover:text-[var(--sonic-gold)] ${active ? 'text-[var(--sonic-gold)]' : 'text-[var(--sonic-muted)]'}`}>
                      <span>{item.name}</span>
                      {active && <Check size={14} />}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="py-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-text)]">Thương hiệu</p>
              <div className="grid gap-1">
                {brands.filter((item) => (item.productCount || 0) > 0 || brand === item.id || brand === item.slug).map((item) => {
                  const active = brand === item.id || brand === item.slug
                  return (
                    <Link key={item.id} href={hrefFor({ brand: item.id, page: 1 })} className={`flex items-center justify-between py-2 text-sm transition-colors hover:text-[var(--sonic-gold)] ${active ? 'text-[var(--sonic-gold)]' : 'text-[var(--sonic-muted)]'}`}>
                      <span>{item.name}</span>
                      <span className="text-[0.64rem] text-[var(--sonic-subtle)]">{item.productCount || 0}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-7 flex flex-col gap-4 border-b border-[var(--sonic-line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--sonic-muted)]">
                {activeCategory?.name || activeBrand?.name || 'Tất cả thiết bị'}{search && ` / “${search}”`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Filter size={14} className="text-[var(--sonic-subtle)]" />
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--sonic-subtle)]">Sắp xếp</span>
                {([
                  ['featured', 'Tuyển chọn'],
                  ['price-asc', 'Giá thấp'],
                  ['price-desc', 'Giá cao'],
                  ['name', 'Tên A — Z'],
                ] as const).map(([value, label]) => (
                  <Link key={value} href={hrefFor({ sort: value, page: 1 })} className={`text-xs transition-colors hover:text-[var(--sonic-gold)] ${sort === value ? 'text-[var(--sonic-gold)]' : 'text-[var(--sonic-muted)]'}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {currentPage === 1 && featuredProduct && (
              <SonicReveal className="mb-5">
                <SonicCatalogFeaturedCard product={featuredProduct} />
              </SonicReveal>
            )}

            {visibleProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {visibleProducts.map((product, index) => <SonicReveal key={product.id} delay={Math.min(index * 0.06, 0.24)} className="h-full"><SonicCatalogProductCard product={product} /></SonicReveal>)}
              </div>
            ) : !featuredProduct ? (
              <div className="sonic-panel px-6 py-16 text-center">
                <p className="sonic-label">Không tìm thấy</p>
                <p className="mt-4 text-xl font-bold text-[var(--sonic-text-strong)]">Thử một bộ lọc khác.</p>
                <Link href="/products" className="sonic-button sonic-button-ghost mt-7">Xem toàn bộ sản phẩm</Link>
              </div>
            ) : null}

            {pageCount > 1 && (
              <nav aria-label="Phân trang sản phẩm" className="mt-10 flex items-center justify-center gap-2">
                <Link href={hrefFor({ page: Math.max(1, currentPage - 1) })} aria-label="Trang trước" aria-disabled={currentPage === 1} className={`flex h-9 w-9 items-center justify-center border border-[var(--sonic-line)] transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-gold)] ${currentPage === 1 ? 'pointer-events-none opacity-35' : ''}`}>
                  <ChevronLeft size={16} />
                </Link>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <Link key={pageNumber} href={hrefFor({ page: pageNumber })} aria-current={pageNumber === currentPage ? 'page' : undefined} className={`flex h-9 min-w-9 items-center justify-center border px-2 text-xs transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-gold)] ${pageNumber === currentPage ? 'border-[var(--sonic-gold)] bg-[var(--sonic-gold)] text-[var(--sonic-button-text)] hover:text-[var(--sonic-button-text)]' : 'border-[var(--sonic-line)] text-[var(--sonic-muted)]'}`}>
                    {pageNumber}
                  </Link>
                ))}
                <Link href={hrefFor({ page: Math.min(pageCount, currentPage + 1) })} aria-label="Trang sau" aria-disabled={currentPage === pageCount} className={`flex h-9 w-9 items-center justify-center border border-[var(--sonic-line)] transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-gold)] ${currentPage === pageCount ? 'pointer-events-none opacity-35' : ''}`}>
                  <ChevronRight size={16} />
                </Link>
              </nav>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--sonic-line)] bg-[var(--sonic-surface)] py-12 md:py-16">
        <div className="sonic-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sonic-panel p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">Nghe thử thực tế</p>
              <h3 className="mt-2 text-base font-bold text-[var(--sonic-text-strong)]">Showroom 264 Phan Đình Phùng</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--sonic-muted)]">Không gian setup sẵn loa thùng, vang số, cục đẩy để khách hàng trải nghiệm chất âm thực tế trước khi lựa chọn.</p>
            </div>
            <div className="sonic-panel p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">Lắp đặt tận nơi</p>
              <h3 className="mt-2 text-base font-bold text-[var(--sonic-text-strong)]">Toàn tỉnh Quảng Ngãi</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--sonic-muted)]">Đội ngũ kỹ thuật hỗ trợ vận chuyển, lắp ráp và cân chỉnh chất âm tận nhà tại TP Quảng Ngãi và các huyện lân cận.</p>
            </div>
            <div className="sonic-panel p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">Xử lý dứt điểm</p>
              <h3 className="mt-2 text-base font-bold text-[var(--sonic-text-strong)]">Cắt hú rít micro 100%</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--sonic-muted)]">Căn chỉnh vang số chuyên nghiệp qua phần mềm máy tính, giọng hát nhẹ, bay bổng, không lo rú rít hỏng loa tép.</p>
            </div>
            <div className="sonic-panel p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">Bảo hành uy tín</p>
              <h3 className="mt-2 text-base font-bold text-[var(--sonic-text-strong)]">Hỗ trợ kỹ thuật 24/7</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--sonic-muted)]">Cam kết thiết bị chính hãng, hỗ trợ kỹ thuật và bảo hành nhanh chóng, đồng hành lâu dài cùng khách hàng.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-16 md:py-24">
        <SonicReveal className="sonic-container grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="sonic-label">Kiến thức / Hi-End</p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-0.05em] text-[var(--sonic-text-strong)] md:text-4xl">Bí quyết chọn Loa Hi-End hoàn hảo cho không gian.</h2>
          </div>
          <div>
            <p className="sonic-copy max-w-2xl text-sm">
              Hệ thống loa đóng vai trò là “giọng hát” của mỗi dàn máy âm thanh. Việc lựa chọn loa nghe nhạc Hi-End không chỉ đơn thuần là mua sắm thiết bị, mà là quá trình tìm kiếm sự đồng điệu giữa đặc tính kỹ thuật, chất âm đặc trưng và đặc điểm âm học của phòng nghe.
            </p>
            <p className="sonic-copy mt-5 max-w-2xl text-sm">
              Tại Tiến Đạt Audio, chúng tôi đồng hành cùng bạn từ việc hiểu không gian đến khi hoàn thiện cấu hình phù hợp.
            </p>
            <Link href="/kien-thuc" className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--sonic-gold)] transition-colors hover:text-[var(--sonic-gold-hover)]">
              Đọc kiến thức <ChevronRight size={15} />
            </Link>
          </div>
        </SonicReveal>
      </section>
    </div>
  )
}
