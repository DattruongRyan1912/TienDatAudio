import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import SonicCatalogProductCard from '@/components/sonic/SonicCatalogProductCard'
import { getBrandBySlug, getBrands, getProducts } from '@/lib/catalog'
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
    title: `${brand.name} — Thương hiệu âm thanh | Tiến Đạt Audio`,
    description: brand.description || `Khám phá các thiết bị ${brand.name} được Tiến Đạt Audio tuyển chọn và tư vấn.`,
    image: brand.logo,
    url: `/thuong-hieu/${brand.slug}`,
  })
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()
  const products = await getProducts({ brand: brand.id })
  const productCount = typeof brand.productCount === 'number' ? brand.productCount : products.length
  const canonicalUrl = absoluteSiteUrl(`/thuong-hieu/${brand.slug}`)
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
    <div className="sonic-page pt-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="sonic-container max-w-[1360px] pb-16 md:pb-24">
        <Link href="/brands" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-gold)]"><span aria-hidden="true">←</span> Brand archive</Link>
        <div className="mt-12 grid gap-10 border-t border-[var(--sonic-line)] pt-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16 md:pt-12">
          <div>
            <p className="sonic-label">{brand.country || 'International partner'} / Selected brand</p>
            <h1 className="sonic-title mt-5 max-w-4xl">{brand.name}</h1>
            <p className="sonic-copy mt-6 max-w-2xl">{brand.description || 'Một thương hiệu được chọn vì vai trò riêng trong hệ thống âm thanh.'}</p>
          </div>
          <div className="border-t border-[var(--sonic-line)] pt-4 md:w-48">
            <p className="text-4xl font-bold tracking-[-0.06em] text-[var(--sonic-gold)]">{String(productCount).padStart(2, '0')}</p>
            <p className="sonic-label mt-2 text-[var(--sonic-subtle)]">Curated products</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] py-16 md:py-24">
        <div className="sonic-container max-w-[1360px]">
          <div className="flex flex-col justify-between gap-5 border-b border-[var(--sonic-line)] pb-7 md:flex-row md:items-end">
            <div><p className="sonic-label">{brand.name} / Collection</p><h2 className="sonic-title mt-4">Thiết bị trong catalog.</h2></div>
            <Link href={`/products?brand=${brand.id}`} className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sonic-gold)]">Xem toàn bộ sản phẩm <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
          </div>
          {products.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <SonicCatalogProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="sonic-panel mt-10 px-6 py-16 text-center"><p className="sonic-label">Catalog đang cập nhật</p><p className="mt-4 text-xl font-bold text-[var(--sonic-text-strong)]">Liên hệ để nhận danh sách thiết bị {brand.name} mới nhất.</p><Link href={`/contact?brand=${encodeURIComponent(brand.name)}`} className="sonic-button sonic-button-gold mt-7">Nói chuyện với chuyên gia <ArrowUpRight size={16} /></Link></div>
          )}
        </div>
      </section>
    </div>
  )
}
