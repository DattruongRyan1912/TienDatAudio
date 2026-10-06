import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check, MessageCircle, Phone, RotateCcw, ShieldCheck, Sparkles, Truck, Wrench } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getCombos } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'
import { generateSEOMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const combos = await getCombos()
  return combos.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const combo = (await getCombos()).find((item) => item.slug === slug)
  if (!combo) return { title: 'Không tìm thấy cấu hình — Tiến Đạt Audio' }

  return generateSEOMetadata({
    pagePath: `/combos/${combo.slug}`,
    title: `${combo.title} — Tiến Đạt Audio Quảng Ngãi`,
    description: combo.description,
    keywords: [combo.title, 'dàn karaoke gia đình', 'bộ âm thanh phối ghép', 'Tiến Đạt Audio Quảng Ngãi'],
  })
}

export default async function ComboDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const combo = (await getCombos()).find((item) => item.slug === slug)
  if (!combo) notFound()

  const image = combo.thumbnail.startsWith('http') || combo.thumbnail.startsWith('/uploads/')
    ? combo.thumbnail
    : '/uploads/1757873177981_wez3lmbcclj.jpg'

  const priceDisplay = combo.comboPrice && combo.comboPrice > 0
    ? formatPrice(combo.comboPrice)
    : 'Báo giá trọn gói qua Zalo'

  const zaloMessage = encodeURIComponent(
    `Xin chào Tiến Đạt Audio! Tôi quan tâm đến cấu hình: "${combo.title}". Vui lòng tư vấn phương án lắp đặt và chiết khấu trọn gói giúp tôi.`
  )

  return (
    <div className="bg-[#f8fafc] pt-24 md:pt-32">
      {/* 1. Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f]">Trang chủ</Link>
            <span>/</span>
            <Link href="/combos" className="hover:text-[#d32f2f]">Dàn Karaoke Trọn Gói</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 line-clamp-1">{combo.title}</span>
          </nav>
        </div>
      </div>

      {/* 2. Main Hero Section */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-xs">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
            {/* Left: Combo Image */}
            <div>
              <div className="relative aspect-[1.25] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shadow-inner">
                <Image
                  src={image}
                  alt={combo.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-[#d32f2f] px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                    Bộ phối ghép chuẩn
                  </span>
                  {combo.tags[0] && (
                    <span className="rounded-md bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
                      {combo.tags[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-xs font-semibold text-slate-600">
                <Sparkles size={14} className="text-[#d32f2f]" />
                <span>Có sẵn máy tại showroom 264 Phan Đình Phùng để hát thử trực tiếp</span>
              </div>
            </div>

            {/* Right: Info & CTA */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">
                  Cấu Hình Đồng Bộ • Tiến Đạt Audio
                </span>

                <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl">
                  {combo.title}
                </h1>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {combo.description}
                </p>

                {/* Price box */}
                <div className="mt-6 rounded-xl border border-red-100 bg-gradient-to-br from-red-50/70 to-orange-50/40 p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Giá trọn bộ:</span>
                    <span className="text-2xl font-black text-[#d32f2f] sm:text-3xl">
                      {priceDisplay}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">
                    Trọn gói bao gồm: Toàn bộ dây tín hiệu canon, dây loa chuyên dụng, công kỹ thuật viên vận chuyển và căn chỉnh âm học tận nơi.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`https://zalo.me/0934995657?text=${zaloMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0068ff] py-3.5 px-4 text-xs font-black text-white shadow-md shadow-[#0068ff]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#0052cc]"
                  >
                    <MessageCircle size={17} />
                    <span>Chat Zalo Báo Giá Trọn Gói</span>
                  </a>

                  <a
                    href="tel:0934995657"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#d32f2f] py-3.5 px-4 text-xs font-black text-white shadow-md shadow-[#d32f2f]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#b71c1c]"
                  >
                    <Phone size={17} />
                    <span>Gọi 0934.995.657</span>
                  </a>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700">Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <Truck size={18} className="shrink-0 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">Giao lắp tận nhà</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <Wrench size={18} className="shrink-0 text-[#d32f2f]" />
                  <span className="text-[11px] font-bold text-slate-700">Cắt hú rít bằng PC</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                  <RotateCcw size={18} className="shrink-0 text-amber-600" />
                  <span className="text-[11px] font-bold text-slate-700">Đổi mới 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features & Detail Info */}
      <section className="mx-auto max-w-[1240px] px-4 py-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          {/* Features */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 md:text-xl">
              Đặc Điểm & Ưu Thế Của Cấu Hình Này
            </h2>
            <div className="mt-5 space-y-3">
              {combo.features.map((feat) => (
                <div key={feat} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-[#f8fafc] p-3 text-xs text-slate-800">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#d32f2f]">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="font-semibold leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 md:text-lg">
              Cần Tùy Biến Cấu Hình Theo Phòng Bạn?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Không có không gian nào hoàn toàn giống nhau. Chúng tôi có thể tăng giảm công suất loa, bổ sung thêm loa sub siêu trầm hoặc đổi mẫu micro theo sở thích hát của các thành viên gia đình.
            </p>
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="block text-xs font-bold text-slate-900">Showroom Tiến Đạt Audio</span>
              <p className="mt-1 text-xs text-slate-600">
                264 Phan Đình Phùng, TP Quảng Ngãi<br />
                Mở cửa: 08:00 — 21:00 hàng ngày (kể cả Thứ 7 & CN)
              </p>
            </div>
            <Link
              href="/combos"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#d32f2f] hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Xem các cấu hình combo khác</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
