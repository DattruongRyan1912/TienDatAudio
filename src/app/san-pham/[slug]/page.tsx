import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, ShieldCheck, Wrench } from 'lucide-react'
import { notFound } from 'next/navigation'
import SonicProductGallery from '@/components/sonic/SonicProductGallery'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getProductBySlug, getRelatedProducts } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'

type ProductPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm — Tiến Đạt Audio' }
  return { title: product.seo?.metaTitle || `${product.name} — Tiến Đạt Audio`, description: product.seo?.metaDescription || product.description }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const related = await getRelatedProducts(product.id, 3)
  const specs = Object.entries(product.specifications)

  return (
    <div className="sonic-page pt-28 md:pt-36">
      <div className="sonic-container">
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989] transition-colors hover:text-[#d4af37]"><ArrowLeft size={14} /> Quay lại catalog</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <SonicProductGallery images={product.images} name={product.name} />
          <div className="flex flex-col justify-center">
            <p className="sonic-label">{product.brand || 'Tiến Đạt Audio'} / {product.category || 'Thiết bị âm thanh'}</p>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.06em] text-[#e5e2e1] md:text-6xl">{product.name}</h1>
            <p className="sonic-copy mt-6 max-w-xl">{product.description}</p>
            <div className="mt-8 flex flex-wrap items-end gap-5 border-y border-white/10 py-6"><div><p className="sonic-label text-[#858989]">Giá tham khảo</p><p className="mt-2 text-2xl font-bold text-[#d4af37]">{product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ tư vấn'}</p></div>{product.inStock && <span className="mb-1 inline-flex items-center gap-2 text-xs text-[#9ea2a2]"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Đang có sẵn</span>}</div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="sonic-button sonic-button-gold">Nhận tư vấn sản phẩm <ArrowUpRight size={16} /></Link><a href="tel:0934995657" className="sonic-button sonic-button-ghost">Gọi 0934 995 657</a></div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="flex items-center gap-3 text-xs text-[#9ea2a2]"><ShieldCheck size={17} className="text-[#d4af37]" /> Bảo hành chính hãng</div><div className="flex items-center gap-3 text-xs text-[#9ea2a2]"><Wrench size={17} className="text-[#d4af37]" /> Hỗ trợ phối ghép</div><div className="flex items-center gap-3 text-xs text-[#9ea2a2]"><Check size={17} className="text-[#d4af37]" /> Kiểm tra trước giao</div></div>
          </div>
        </div>
      </div>

      <section className="sonic-container mt-20 border-t border-white/10 pt-16 md:mt-28 md:pt-20"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="sonic-label">Thông số kỹ thuật</p><h2 className="sonic-title mt-4">Mọi chi tiết đều có lý do.</h2><p className="sonic-copy mt-5">Thông số giúp định hình lựa chọn. Trải nghiệm thực tế giúp hoàn thiện quyết định.</p></div><div className="border-t border-white/15">{specs.length > 0 ? specs.map(([key, value]) => <div key={key} className="grid grid-cols-[.75fr_1.25fr] gap-4 border-b border-white/10 py-4 text-sm md:grid-cols-2"><span className="text-[#858989]">{key.replaceAll('_', ' ')}</span><span className="text-right text-[#e5e2e1] md:text-left">{Array.isArray(value) ? value.join(', ') : value}</span></div>) : <div className="py-6 text-sm text-[#9ea2a2]">Thông số chi tiết sẽ được cập nhật. Liên hệ để nhận tư vấn cấu hình.</div>}</div></div></section>

      <section className="border-y border-white/10 bg-[#0d0d0d] py-16 md:py-20"><div className="sonic-container"><p className="sonic-label">Điểm nổi bật</p><div className="mt-8 grid gap-x-8 gap-y-4 md:grid-cols-2">{product.features.map((feature) => <div key={feature} className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-[#c4c7c7]"><Check size={16} className="mt-0.5 shrink-0 text-[#d4af37]" />{feature}</div>)}</div></div></section>

      <section className="sonic-container py-16 md:py-24"><div className="grid gap-4 md:grid-cols-2"><div><p className="sonic-label">Câu hỏi thường gặp</p><h2 className="sonic-title mt-4">Cần thêm một góc nhìn?</h2></div><div className="border-t border-white/15">{['Sản phẩm này phù hợp với không gian nào?', 'Có thể nghe thử hoặc phối ghép cùng thiết bị khác không?', 'Chính sách bảo hành và lắp đặt như thế nào?'].map((question) => <details key={question} className="group border-b border-white/10 py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#e5e2e1]"><span>{question}</span><ChevronDown size={16} className="text-[#d4af37] transition-transform group-open:rotate-180" /></summary><p className="sonic-copy mt-4 pr-8 text-sm">Đội ngũ Tiến Đạt Audio sẽ dựa trên phòng, nhu cầu và hệ thống hiện có để tư vấn trực tiếp. Bạn có thể đặt lịch nghe thử hoặc gửi yêu cầu ngay hôm nay.</p></details>)}</div></div></section>

      {related.length > 0 && <section className="border-t border-white/10 bg-[#0d0d0d] py-16 md:py-24"><div className="sonic-container"><p className="sonic-label">Có thể bạn quan tâm</p><div className="mt-8 grid gap-4 md:grid-cols-3">{related.map((item) => <SonicProductCard key={item.id} product={item} />)}</div></div></section>}
    </div>
  )
}

