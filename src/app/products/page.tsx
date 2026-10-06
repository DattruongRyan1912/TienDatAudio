import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, MessageCircle, Phone, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
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
  const page = Math.max(1, Number(first(params.page)) || 1)

  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({ search, category, brand }),
  ])

  const activeCategory = categories.find((item) => item.id === category || item.slug === category)
  const activeBrand = brands.find((item) => item.id === brand || item.slug === brand)

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price-asc') return (a.salePrice || a.price) - (b.salePrice || b.price)
    if (sort === 'price-desc') return (b.salePrice || b.price) - (a.salePrice || a.price)
    if (sort === 'name') return a.name.localeCompare(b.name)
    return (
      Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)) ||
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      b.createdAt.localeCompare(a.createdAt)
    )
  })

  const categoryHeadingMap: Record<string, { h1: string; subtitle: string }> = {
    'loa-thung': {
      h1: 'Loa Thùng Karaoke & Loa Sân Khấu Chính Hãng',
      subtitle: 'Tuyển chọn các dòng loa full bass 25, 30, 40 chuyên trị karaoke gia đình và hội trường cao cấp, âm thanh trung thực, tiếng sáng rõ.',
    },
    'loa-tram': {
      h1: 'Loa Sub Siêu Trầm Karaoke & Nghe Nhạc',
      subtitle: 'Loa trầm điện và hơi công suất mạnh mẽ, tăng cường dải bass sâu uy lực, tạo độ dày dặn cho dàn karaoke phòng khách.',
    },
    'vang-so': {
      h1: 'Vang Số Chống Hú Kỹ Thuật Số Chuyên Nghiệp',
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
    || (search ? `Kết quả tìm kiếm cho “${search}”` : 'Danh Mục Thiết Bị Âm Thanh Chính Hãng')

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

  const pageSize = 12
  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
    <div className="bg-[#f8fafc] pt-24 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogStructuredData) }}
      />

      {/* 1. Header Banner & Quick Category Filter */}
      <section className="border-b border-slate-200 bg-white py-6 md:py-10">
        <div className="mx-auto max-w-[1240px] px-4">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f]">Trang chủ</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#d32f2f]">Sản phẩm</Link>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="font-semibold text-slate-800">{activeCategory.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d32f2f]">
                <Sparkles size={13} />
                <span>Showroom Tiến Đạt Audio Quảng Ngãi</span>
              </div>
              <h1 className="mt-2.5 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl">
                {dynamicH1}
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                {dynamicSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
                <span className="block text-2xl font-black text-[#d32f2f]">{sortedProducts.length}</span>
                <span className="block text-[11px] font-semibold text-slate-500">Thiết bị sẵn có</span>
              </div>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
            <span className="text-xs font-bold text-slate-500">Phân loại nhanh:</span>
            <Link
              href="/products"
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                !category
                  ? 'bg-[#d32f2f] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]'
              }`}
            >
              Tất cả
            </Link>
            {categories.map((cat) => {
              const isActive = category === cat.id || category === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={hrefFor({ category: cat.id, page: 1 })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-[#d32f2f] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2. Main Catalog Grid & Filter Layout */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#d32f2f]" />
                  <span className="font-bold text-slate-900">Bộ Lọc Thiết Bị</span>
                </div>
                {(activeCategory || activeBrand || search) && (
                  <Link href="/products" className="text-xs font-semibold text-[#d32f2f] hover:underline">
                    Xóa lọc
                  </Link>
                )}
              </div>

              {/* Search Inside Catalog */}
              <form action="/products" className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Tìm mã thiết bị..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#d32f2f] focus:bg-white"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {category && <input type="hidden" name="category" value={category} />}
                {brand && <input type="hidden" name="brand" value={brand} />}
              </form>

              {/* Category Filter Group */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Danh Mục Sản Phẩm</h3>
                <div className="mt-3 space-y-1">
                  {categories.map((cat) => {
                    const isActive = category === cat.id || category === cat.slug
                    return (
                      <Link
                        key={cat.id}
                        href={hrefFor({ category: cat.id, page: 1 })}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-red-50 text-[#d32f2f]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && <Check size={14} className="text-[#d32f2f]" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Brand Filter Group */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Thương Hiệu</h3>
                <div className="mt-3 space-y-1">
                  {brands
                    .filter((item) => (item.productCount || 0) > 0 || brand === item.id || brand === item.slug)
                    .map((b) => {
                      const isActive = brand === b.id || brand === b.slug
                      return (
                        <Link
                          key={b.id}
                          href={hrefFor({ brand: b.id, page: 1 })}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-red-50 text-[#d32f2f]'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{b.name}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            {b.productCount || 0}
                          </span>
                        </Link>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Quick Hotline Support Card */}
            <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50/50 p-5 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d32f2f]">
                Tư Vấn Trực Tiếp
              </span>
              <h4 className="mt-1 text-sm font-bold text-slate-900">
                Chưa biết chọn cấu hình nào phù hợp phòng?
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Kỹ thuật viên Tiến Đạt Audio hỗ trợ đo đạc, tư vấn ghép nối chuẩn âm học miễn phí.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href="tel:0934995657"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#d32f2f] py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#b71c1c]"
                >
                  <Phone size={13} />
                  <span>Gọi 0934.995.657</span>
                </a>
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#0068ff] py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0052cc]"
                >
                  <MessageCircle size={13} />
                  <span>Chat Zalo Báo Giá</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Product Grid & Sorting Toolbar */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">
                Đang xem <strong className="text-slate-900">{visibleProducts.length}</strong> / {sortedProducts.length} sản phẩm
                {activeCategory && <span> thuộc <strong className="text-[#d32f2f]">{activeCategory.name}</strong></span>}
                {brand && <span> hãng <strong className="text-[#d32f2f]">{activeBrand?.name}</strong></span>}
              </p>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Sắp xếp:</span>
                {([
                  ['featured', 'Nổi bật'],
                  ['price-asc', 'Giá tăng dần'],
                  ['price-desc', 'Giá giảm dần'],
                  ['name', 'Tên A-Z'],
                ] as const).map(([value, label]) => (
                  <Link
                    key={value}
                    href={hrefFor({ sort: value, page: 1 })}
                    className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                      sort === value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((prod) => (
                  <SonicProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Search size={36} className="mx-auto text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-900">Không tìm thấy thiết bị phù hợp</h3>
                <p className="mt-1.5 text-xs text-slate-500">
                  Hãy thử chọn danh mục khác hoặc tìm kiếm với từ khóa ngắn gọn hơn.
                </p>
                <Link
                  href="/products"
                  className="mt-5 inline-block rounded-md bg-[#d32f2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#b71c1c]"
                >
                  Xem toàn bộ thiết bị
                </Link>
              </div>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
              <nav aria-label="Phân trang sản phẩm" className="mt-10 flex items-center justify-center gap-2">
                <Link
                  href={hrefFor({ page: Math.max(1, currentPage - 1) })}
                  aria-label="Trang trước"
                  aria-disabled={currentPage === 1}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#d32f2f] hover:text-[#d32f2f] ${
                    currentPage === 1 ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <ChevronLeft size={16} />
                </Link>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={hrefFor({ page: pageNumber })}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                      pageNumber === currentPage
                        ? 'border border-[#d32f2f] bg-[#d32f2f] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}
                <Link
                  href={hrefFor({ page: Math.min(pageCount, currentPage + 1) })}
                  aria-label="Trang sau"
                  aria-disabled={currentPage === pageCount}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#d32f2f] hover:text-[#d32f2f] ${
                    currentPage === pageCount ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <ChevronRight size={16} />
                </Link>
              </nav>
            )}
          </div>
        </div>
      </section>

      {/* 3. Cam kết dịch vụ showroom Tiến Đạt Audio */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d32f2f]">Trải nghiệm thực tế</span>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900">Showroom 264 Phan Đình Phùng</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Setup sẵn phòng thử âm thanh thực tế với loa thùng, vang số, cục đẩy để nghe trực tiếp trước khi chọn.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d32f2f]">Miễn phí vận chuyển</span>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900">Lắp đặt tận nhà tại Quảng Ngãi</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Đội ngũ kỹ thuật hỗ trợ giao hàng, lắp ráp và cân chỉnh chất âm tận nơi trong bán kính 30km.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d32f2f]">Kỹ thuật chuyên sâu</span>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900">Cắt hú rít dứt điểm 100%</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Căn chỉnh vang số chi tiết qua phần mềm máy tính, giọng hát nhẹ hơi, bay bổng, không lo rú rít hỏng treble.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d32f2f]">Hậu mãi dài lâu</span>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900">Bảo hành 12 - 24 tháng chính hãng</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Cam kết thiết bị chính hãng 100%, hỗ trợ kỹ thuật trọn đời, đổi mới trong 7 ngày nếu có lỗi từ nhà sản xuất.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
