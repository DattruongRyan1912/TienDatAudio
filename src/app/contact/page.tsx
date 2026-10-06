import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Headphones,
  Truck,
  Wrench,
  Navigation,
  ChevronRight,
} from 'lucide-react'
import SonicContactForm from '@/components/sonic/SonicContactForm'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/contact',
  title: 'Liên hệ & Đặt lịch nghe thử — Tiến Đạt Audio',
  description:
    'Đặt lịch nghe thử thực tế và nhận tư vấn cấu hình âm thanh tại Showroom Tiến Đạt Audio, 264 Phan Đình Phùng, TP. Quảng Ngãi. Hotline tư vấn 24/7: 0934.995.657.',
  keywords: [
    'tư vấn âm thanh Quảng Ngãi',
    'showroom âm thanh Quảng Ngãi',
    'nghe thử loa Quảng Ngãi',
    'lắp đặt âm thanh Quảng Ngãi',
    'Tiến Đạt Audio',
  ],
})

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; productId?: string; article?: string }>
}) {
  const [profile, params] = await Promise.all([getBusinessProfile(), searchParams])
  const phoneHref = formatPhoneHref(profile.phone)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Liên hệ & Đặt lịch trải nghiệm</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-10 max-w-3xl">
          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
            Tư vấn chuyên sâu — Showroom Quảng Ngãi
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Liên hệ & Đặt lịch nghe thử âm thanh
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Hãy để chúng tôi biết diện tích phòng, sở thích âm nhạc và ngân sách của bạn. Đội ngũ kỹ thuật viên của Tiến Đạt Audio sẽ tư vấn giải pháp cân chỉnh chính xác và tối ưu nhất.
          </p>
        </div>

        {/* Main Grid: Form + Info */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <SonicContactForm
              product={params.product}
              productId={params.productId}
              articleId={params.article}
            />
          </div>

          {/* Right Column: Showroom info & Direct Contacts (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Quick Action Hotline Box */}
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Tư vấn nhanh qua điện thoại / Zalo
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Kỹ thuật viên trực máy 08:00 – 21:00 hỗ trợ tư vấn tức thì mọi ngày trong tuần:
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`tel:${phoneHref}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d32f2f] py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#b71c1c]"
                >
                  <Phone size={18} />
                  <span>Gọi: {profile.phone}</span>
                </a>
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0068ff] py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#0052cc]"
                >
                  <MessageCircle size={18} />
                  <span>Chat Zalo Báo Giá</span>
                </a>
              </div>
            </div>

            {/* Showroom Visual & Address Details */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src="/uploads/1757873177981_wez3lmbcclj.jpg"
                  alt="Không gian trải nghiệm âm thanh tại Showroom Tiến Đạt Audio"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    Phòng Nghe Thực Tế
                  </span>
                  <h4 className="text-sm font-bold text-white">Showroom Tiến Đạt Audio Quảng Ngãi</h4>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-red-100 p-2 text-[#d32f2f] shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-slate-500">Địa chỉ Showroom</h5>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 leading-snug">
                      {profile.address.formatted}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address.formatted)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#0068ff] hover:underline"
                    >
                      <Navigation size={12} />
                      Mở Google Maps chỉ đường
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0 mt-0.5">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-slate-500">Giờ làm việc</h5>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">
                      {profile.businessHours.join(' / ')}
                    </p>
                    <p className="text-xs text-slate-500">Mở cửa cả Thứ 7 & Chủ Nhật</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-700 shrink-0 mt-0.5">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-slate-500">Email liên hệ</h5>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Trust Badges */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                Đặc quyền khách hàng tại Tiến Đạt Audio
              </h4>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Headphones size={18} className="text-[#d32f2f] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-slate-800">Nghe thử & so sánh trực tiếp:</strong>
                    <span className="text-slate-600 block mt-0.5">
                      Thử nghiệm cùng lúc nhiều cấu hình loa, micro, amply trong phòng setup chuẩn.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#d32f2f] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-slate-800">100% Chính hãng & CO/CQ:</strong>
                    <span className="text-slate-600 block mt-0.5">
                      Cam kết hoàn tiền 200% nếu phát hiện hàng nhái, bảo hành điện tử chính hãng.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-[#d32f2f] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-slate-800">Giao hàng & Lắp đặt tận nơi:</strong>
                    <span className="text-slate-600 block mt-0.5">
                      Hỗ trợ giao hàng hỏa tốc và lắp đặt căn chỉnh tận phòng tại Quảng Ngãi và lân cận.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench size={18} className="text-[#d32f2f] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-slate-800">Cân chỉnh kỹ thuật trọn đời:</strong>
                    <span className="text-slate-600 block mt-0.5">
                      Kỹ thuật viên hỗ trợ căn chỉnh vang số, cắt rú rít micro tận tình qua hotline/Zalo.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Google Maps & Direct directions guide */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bản đồ chỉ đường đến Showroom</h3>
              <p className="text-xs text-slate-500">264 Phan Đình Phùng, Phường Chánh Lộ, Thành phố Quảng Ngãi</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Tiến Đạt Audio 264 Phan Đình Phùng Quảng Ngãi')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <Navigation size={14} className="text-[#0068ff]" />
              Mở trên ứng dụng Google Maps
            </a>
          </div>
          <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-96">
            <iframe
              src="https://www.google.com/maps?q=264+Phan+%C4%90%C3%ACnh+Ph%C3%B9ng,+Ch%C3%A1nh+L%E1%BB%99,+Qu%E1%BA%A3ng+Ng%C3%A3i&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tiến Đạt Audio Google Maps"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
