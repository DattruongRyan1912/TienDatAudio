import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { Check, ChevronDown, MessageCircle, Phone, RotateCcw, ShieldCheck, Sparkles, Truck, Wrench } from 'lucide-react'
import { notFound } from 'next/navigation'
import SonicProductGallery from '@/components/sonic/SonicProductGallery'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getProductBySlug, getProducts, getRelatedProducts } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'
import { getBusinessProfile } from '@/lib/business-profile'
import ContentViewTracker from '@/components/analytics/ContentViewTracker'
import { defaultOpenGraphImage, generateProductStructuredData, generateSEOMetadata, getProductCanonicalPath } from '@/lib/seo'

type ProductPageProps = { params: Promise<{ slug: string }> }

export const revalidate = 300

const getProduct = cache((slug: string) => getProductBySlug(slug))

export async function generateStaticParams() {
  return (await getProducts({ limit: 500 })).map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm — Tiến Đạt Audio', robots: { index: false, follow: false } }
  return generateSEOMetadata({
    title: product.seo?.metaTitle || `${product.name} — Tiến Đạt Audio`,
    description: product.seo?.metaDescription || product.description,
    keywords: product.seo?.keywords,
    image: product.seo?.ogImage || product.images[0] || defaultOpenGraphImage,
    url: getProductCanonicalPath(product),
    noIndex: product.seo?.noIndex,
  })
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, profile] = await Promise.all([getProduct(slug), getBusinessProfile()])
  if (!product) notFound()
  const related = await getRelatedProducts(product.id, 3, product.category_id)
  const specs = Object.entries(product.specifications)
  const structuredData = generateProductStructuredData(product)

  const zaloMessage = encodeURIComponent(
    `Xin chào Tiến Đạt Audio! Tôi đang quan tâm đến sản phẩm "${product.name}". Vui lòng tư vấn báo giá và ưu đãi lắp đặt giúp tôi.`
  )

  return (
    <div className="bg-[#f8fafc] pt-24 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ContentViewTracker type="product" id={product.id} />

      {/* 1. Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f]">Trang chủ</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#d32f2f]">Sản phẩm</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/products?category=${product.category_id || ''}`} className="hover:text-[#d32f2f]">
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. Main Product Info */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-xs">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
            {/* Left: Gallery */}
            <div>
              <SonicProductGallery images={product.images} name={product.name} />
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-xs font-semibold text-slate-600">
                <Sparkles size={14} className="text-[#d32f2f]" />
                <span>Trải nghiệm nghe thử âm thanh thực tế tại showroom 264 Phan Đình Phùng</span>
              </div>
            </div>

            {/* Right: Product Purchase Details */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Brand & Stock */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {product.brand || 'Tiến Đạt Audio'} • {product.category || 'Thiết bị'}
                  </span>
                  {product.inStock && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Có sẵn hàng tại showroom
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="mt-3 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl">
                  {product.name}
                </h1>

                {/* Short Description */}
                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {product.description}
                </p>

                {/* Price Box */}
                <div className="mt-6 rounded-xl border border-red-100 bg-gradient-to-br from-red-50/70 to-orange-50/40 p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Giá bán:</span>
                    <span className="text-2xl font-black text-[#d32f2f] sm:text-3xl">
                      {product.price ? formatPrice(product.salePrice || product.price) : 'Báo giá tốt qua Zalo'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">
                    {product.price
                      ? 'Giá đã bao gồm dịch vụ vận chuyển và kỹ thuật viên cân chỉnh âm học tận nhà.'
                      : 'Liên hệ để nhận chiết khấu tốt nhất kèm gói lắp đặt trọn gói tại Quảng Ngãi.'}
                  </p>
                </div>

                {/* Action CTA Buttons */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`https://zalo.me/0934995657?text=${zaloMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0068ff] py-3.5 px-4 text-xs font-black text-white shadow-md shadow-[#0068ff]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#0052cc]"
                  >
                    <MessageCircle size={17} />
                    <span>Chat Zalo Báo Giá Ngay</span>
                  </a>

                  <a
                    href={`tel:${profile.phone.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#d32f2f] py-3.5 px-4 text-xs font-black text-white shadow-md shadow-[#d32f2f]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#b71c1c]"
                  >
                    <Phone size={17} />
                    <span>Gọi {profile.phone}</span>
                  </a>
                </div>

                {/* Quick Consultation Link */}
                <div className="mt-3 text-center">
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.name)}&productId=${encodeURIComponent(product.id)}`}
                    className="text-xs font-bold text-slate-600 hover:text-[#d32f2f] hover:underline"
                  >
                    Hoặc để lại số điện thoại, chúng tôi sẽ gọi lại tư vấn miễn phí &rarr;
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <ShieldCheck size={20} className="shrink-0 text-emerald-600" />
                  <span className="text-[11px] font-bold leading-tight text-slate-700">Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <Truck size={20} className="shrink-0 text-blue-600" />
                  <span className="text-[11px] font-bold leading-tight text-slate-700">Miễn phí giao 30km</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <Wrench size={20} className="shrink-0 text-[#d32f2f]" />
                  <span className="text-[11px] font-bold leading-tight text-slate-700">Cân chỉnh DSP tận nơi</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <RotateCcw size={20} className="shrink-0 text-amber-600" />
                  <span className="text-[11px] font-bold leading-tight text-slate-700">Đổi mới 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Specs & Highlights Tab Section */}
      <section className="mx-auto max-w-[1240px] px-4 py-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          {/* Left: Technical Specifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 md:text-xl">
              Thông Số Kỹ Thuật Chi Tiết
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Thông số thực tế từ nhà sản xuất giúp khách hàng phối ghép chuẩn công suất và trở kháng.
            </p>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              {specs.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {specs.map(([key, value], idx) => (
                    <div
                      key={key}
                      className={`grid grid-cols-[140px_1fr] p-3 sm:grid-cols-[180px_1fr] sm:p-3.5 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <span className="font-bold text-slate-700 capitalize">
                        {key.replaceAll('_', ' ')}
                      </span>
                      <span className="font-medium text-slate-900">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Thông số đang được cập nhật. Vui lòng liên hệ hotline để nhận catalog kỹ thuật đầy đủ.
                </div>
              )}
            </div>
          </div>

          {/* Right: Key Features & Why Choose Us */}
          <div className="space-y-6">
            {/* Features */}
            {product.features.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <h3 className="text-base font-black text-slate-900 md:text-lg">
                  Đặc Điểm & Tính Năng Nổi Bật
                </h3>
                <div className="mt-4 space-y-3">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#d32f2f]">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
              <h3 className="text-base font-black text-slate-900 md:text-lg">
                Câu Hỏi Thường Gặp
              </h3>
              <div className="mt-4 divide-y divide-slate-100 text-xs">
                {[
                  {
                    q: 'Sản phẩm này phù hợp cho phòng diện tích bao nhiêu m²?',
                    a: 'Thiết bị được thiết kế tối ưu cho phòng khách gia đình từ 20m² - 45m², đảm bảo phủ âm đều và tiếng bass không bị dội.',
                  },
                  {
                    q: 'Tôi có thể mang đĩa nhạc hoặc đến showroom nghe thử không?',
                    a: 'Hoàn toàn được! Showroom tại 264 Phan Đình Phùng luôn sẵn sàng phòng nghe để bạn trải nghiệm trực tiếp chất âm trước khi mua.',
                  },
                  {
                    q: 'Chính sách bảo hành và hỗ trợ sau lắp đặt như thế nào?',
                    a: 'Tiến Đạt Audio bảo hành chính hãng từ 12 - 24 tháng, cam kết kỹ thuật viên hỗ trợ căn chỉnh tận nhà trong suốt quá trình sử dụng.',
                  },
                ].map((item) => (
                  <details key={item.q} className="group py-3.5">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-800 hover:text-[#d32f2f]">
                      <span>{item.q}</span>
                      <ChevronDown size={14} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-slate-600 leading-relaxed pr-4">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Related Products Section */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-12 md:py-16">
          <div className="mx-auto max-w-[1240px] px-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">
                  Gợi Ý Phối Ghép
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Thiết Bị Cùng Phân Khúc & Phối Ghép Tương Thích
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#d32f2f] hover:underline"
              >
                Xem tất cả sản phẩm &rarr;
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <SonicProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
