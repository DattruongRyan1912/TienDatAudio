import Link from 'next/link'
import { ArrowUpRight, Check, Filter, Search, SlidersHorizontal } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getBrands, getCategories, getProducts } from '@/lib/catalog'

export const metadata = {
  title: 'Sản phẩm — Tiến Đạt Audio',
  description: 'Khám phá bộ sưu tập loa, vang số và thiết bị âm thanh được tuyển chọn tại Tiến Đạt Audio.',
}

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const search = first(params.search) || ''
  const category = first(params.category) || ''
  const brand = first(params.brand) || ''
  const sort = first(params.sort) || 'featured'
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
  const sortHref = (value: string) => {
    const next = new URLSearchParams()
    if (search) next.set('search', search)
    if (category) next.set('category', category)
    if (brand) next.set('brand', brand)
    if (value !== 'featured') next.set('sort', value)
    const result = next.toString()
    return result ? `/products?${result}` : '/products'
  }

  return (
    <div className="sonic-page pt-28 md:pt-36">
      <section className="sonic-container pb-14 md:pb-20">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="sonic-label">Catalog / 2025 — 2026</p>
            <h1 className="sonic-title mt-5 max-w-3xl">Thiết bị cho một trải nghiệm nghe có chủ đích.</h1>
            <p className="sonic-copy mt-5 max-w-xl">Mỗi cấu hình bắt đầu từ không gian, gu nghe và cách bạn muốn âm thanh hiện diện trong đời sống.</p>
          </div>
          <div className="text-left md:text-right"><p className="text-4xl font-bold tracking-[-0.05em] text-[#d4af37]">{sortedProducts.length.toString().padStart(2, '0')}</p><p className="sonic-label mt-2 text-[#858989]">Sản phẩm trong catalog</p></div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="sonic-container py-7">
          <form action="/products" className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858989]" /><input name="search" defaultValue={search} className="sonic-input pl-11" placeholder="Tìm kiếm thiết bị, thương hiệu..." /></div>
            {category && <input type="hidden" name="category" value={category} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            <button type="submit" className="sonic-button sonic-button-gold">Tìm kiếm</button>
          </form>
        </div>
      </section>

      <section className="sonic-container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center justify-between border-b border-white/15 pb-4"><p className="sonic-label">Bộ lọc</p><SlidersHorizontal size={16} className="text-[#d4af37]" /></div>
            {(activeCategory || activeBrand || search) && <div className="flex flex-wrap gap-2 border-b border-white/10 py-4"><span className="text-xs text-[#858989]">Đang chọn:</span>{[activeCategory?.name, activeBrand?.name, search && `“${search}”`].filter(Boolean).map((item) => <span key={item as string} className="border border-[#d4af37]/50 px-2 py-1 text-[0.62rem] text-[#d4af37]">{item}</span>)}<Link href="/products" className="ml-auto text-[0.62rem] uppercase tracking-wider text-[#858989] hover:text-[#d4af37]">Xóa</Link></div>}
            <div className="border-b border-white/10 py-5"><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#c4c7c7]">Danh mục</p><div className="grid gap-1">{categories.map((item) => <Link key={item.id} href={`/products?category=${item.id}`} className={`flex items-center justify-between py-2 text-sm transition-colors hover:text-[#d4af37] ${category === item.id || category === item.slug ? 'text-[#d4af37]' : 'text-[#9ea2a2]'}`}><span>{item.name}</span>{(category === item.id || category === item.slug) && <Check size={14} />}</Link>)}</div></div>
            <div className="border-b border-white/10 py-5"><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#c4c7c7]">Thương hiệu</p><div className="grid gap-1">{brands.map((item) => <Link key={item.id} href={`/products?brand=${item.id}`} className={`flex items-center justify-between py-2 text-sm transition-colors hover:text-[#d4af37] ${brand === item.id || brand === item.slug ? 'text-[#d4af37]' : 'text-[#9ea2a2]'}`}><span>{item.name}</span><span className="text-[0.64rem] text-[#707474]">{item.productCount || 0}</span></Link>)}</div></div>
          </aside>

          <div>
            <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[#9ea2a2]">{activeCategory?.name || activeBrand?.name || 'Tất cả thiết bị'} {search && ` / “${search}”`}</p><div className="flex flex-wrap items-center gap-3"><Filter size={14} className="text-[#858989]" /><span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#707474]">Sắp xếp</span>{[['featured', 'Tuyển chọn'], ['price-asc', 'Giá thấp'], ['price-desc', 'Giá cao'], ['name', 'Tên A — Z']].map(([value, label]) => <Link key={value} href={sortHref(value)} className={`text-xs transition-colors hover:text-[#d4af37] ${sort === value ? 'text-[#d4af37]' : 'text-[#9ea2a2]'}`}>{label}</Link>)}</div></div>
            {sortedProducts.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{sortedProducts.map((product, index) => <SonicProductCard key={product.id} product={product} featured={index === 0 && sortedProducts.length > 3} />)}</div> : <div className="sonic-panel px-6 py-16 text-center"><p className="sonic-label">Không tìm thấy</p><p className="mt-4 text-xl font-bold">Thử một bộ lọc khác.</p><Link href="/products" className="sonic-button sonic-button-ghost mt-7">Xem toàn bộ sản phẩm</Link></div>}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111111] py-16 md:py-20"><div className="sonic-container grid gap-8 md:grid-cols-[1fr_2fr] md:items-end"><div><p className="sonic-label">Không chỉ là thông số</p><h2 className="mt-4 text-3xl font-bold tracking-[-0.05em]">Chọn bằng tai.<br />Quyết định bằng trải nghiệm.</h2></div><div><p className="sonic-copy max-w-2xl text-sm">Giá trên website chỉ là điểm bắt đầu. Để có cấu hình đúng, hãy mang theo diện tích phòng, thể loại nhạc yêu thích và kỳ vọng sử dụng — phần còn lại để đội ngũ Tiến Đạt Audio cùng bạn hoàn thiện.</p><Link href="/contact" className="group mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#d4af37]">Nhận tư vấn phối ghép <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></div></section>
    </div>
  )
}
