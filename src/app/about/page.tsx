import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Mic2,
  Music,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/about',
  title: 'Giới thiệu về Tiến Đạt Audio — Chuyên gia Âm thanh tại Quảng Ngãi',
  description:
    'Tiến Đạt Audio — hơn 10 năm kinh nghiệm tư vấn, phối ghép và lắp đặt giải pháp âm thanh gia đình, karaoke, cafe và sân khấu hội trường tại Quảng Ngãi.',
  keywords: [
    'Tiến Đạt Audio',
    'giới thiệu Tiến Đạt Audio',
    'cửa hàng âm thanh Quảng Ngãi',
    'showroom âm thanh Quảng Ngãi',
    'lắp đặt âm thanh karaoke Quảng Ngãi',
  ],
})

export default async function AboutPage() {
  const profile = await getBusinessProfile()
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
          <span className="font-semibold text-slate-700">Về Tiến Đạt Audio</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-12 max-w-3xl">
          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
            Uy tín hơn 10 năm tại Quảng Ngãi
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Mang Âm Thanh Đích Thực Đến Từng Không Gian Sống
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed md:text-lg">
            Tại Tiến Đạt Audio, chúng tôi tin rằng một dàn âm thanh xuất sắc không chỉ nằm ở giá tiền hay thông số trên giấy, mà nằm ở sự hòa hợp tuyệt đối giữa thiết bị, âm học căn phòng và gu thưởng thức của bạn.
          </p>
        </div>

        {/* Hero Image & Milestones */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <div className="relative h-72 w-full sm:h-96 lg:h-[420px]">
            <Image
              src="/uploads/1757911498269_vky7s589yrq.jpg"
              alt="Không gian trải nghiệm thực tế tại Showroom Tiến Đạt Audio Quảng Ngãi"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-10 md:left-10 md:right-10">
              <span className="rounded-full bg-[#d32f2f] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                Showroom Trực Tiếp
              </span>
              <p className="mt-2 text-xl font-bold md:text-2xl">
                Không gian phòng nghe chuẩn âm tại 264 Phan Đình Phùng, TP. Quảng Ngãi
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-100 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="p-6 text-center">
              <p className="text-3xl font-extrabold text-[#d32f2f] md:text-4xl">10+</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Năm Kinh Nghiệm
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-extrabold text-[#d32f2f] md:text-4xl">5.000+</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Khách Hàng & Dự Án
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-extrabold text-[#d32f2f] md:text-4xl">100%</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Chính Hãng Phân Phối
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-extrabold text-[#d32f2f] md:text-4xl">24/7</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Hỗ Trợ Kỹ Thuật
              </p>
            </div>
          </div>
        </div>

        {/* Story & Philosophy Section */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
              Câu chuyện của chúng tôi
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Từ Đam Mê Âm Thanh Đến Showroom Chuyên Nghiệp Hàng Đầu
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                Khởi đầu từ niềm đam mê thuần túy với các thiết bị âm thanh analog và kỹ thuật số, Tiến Đạt Audio đã trải qua hơn một thập kỷ đồng hành cùng hàng ngàn khách hàng tại Quảng Ngãi và các tỉnh miền Trung.
              </p>
              <p>
                Khác biệt lớn nhất của Tiến Đạt Audio là chúng tôi không bán sản phẩm theo kiểu thương mại đơn thuần. Mỗi sản phẩm trước khi giao đến tay khách hàng đều được đội ngũ kỹ thuật viên kiểm định chất lượng nghiêm ngặt, cân chỉnh phối ghép để đạt hiệu suất âm thanh tối đa và độ bền cao nhất.
              </p>
              <p>
                Dù bạn cần một chiếc loa bluetooth nhỏ gọn cho bàn làm việc, một dàn karaoke gia đình ấm cúng, hay một hệ thống âm thanh biểu diễn cho phòng trà - hội trường quy mô lớn, chúng tôi đều dành trọn sự tỉ mỉ để tư vấn.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 size={16} className="text-[#d32f2f]" />
                Cam kết giá tốt nhất thị trường
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 size={16} className="text-[#d32f2f]" />
                Bảo hành chính hãng 12 - 24 tháng
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 size={16} className="text-[#d32f2f]" />
                Hỗ trợ trả góp linh hoạt 0%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-red-100 p-3 text-[#d32f2f] w-fit">
                  <Award size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Thương hiệu Quốc Tế</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Đối tác phân phối các thương hiệu hàng đầu: JBL, Bose, BMB, Paramax, Yamaha, Denon...
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-blue-100 p-3 text-[#0068ff] w-fit">
                  <Wrench size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Setup Chuyên Sâu</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Cân chỉnh bằng máy đo RTA và phần mềm chuyên dụng, cắt dứt điểm hú rít khó chịu.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600 w-fit">
                  <Users size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Tận Tâm Đồng Hành</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Hỗ trợ tận nơi tại nhà, hướng dẫn gia chủ làm chủ thiết bị một cách dễ dàng nhất.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 w-fit">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">An Tâm Tuyệt Đối</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Chế độ đổi mới 30 ngày và bảo trì định kỳ trọn đời cho toàn bộ hệ thống đã lắp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Solutions Section */}
        <div className="mb-16 rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
              Dịch vụ chuyên nghiệp
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Các Giải Pháp Âm Thanh Chủ Lực Tại Tiến Đạt Audio
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Đáp ứng trọn vẹn mọi nhu cầu từ cá nhân, gia đình đến dự án kinh doanh chuyên nghiệp.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="rounded-xl bg-red-100 p-3 text-[#d32f2f] w-fit">
                <Mic2 size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Dàn Karaoke Gia Đình</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Bộ combo tuyển chọn chất âm chuẩn mực, hát nhẹ hơi, micro sáng rõ, chống hú 100%.
              </p>
              <Link
                href="/combos"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#d32f2f] hover:underline"
              >
                Xem các bộ combo <ArrowRight size={12} />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="rounded-xl bg-blue-100 p-3 text-[#0068ff] w-fit">
                <Music size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Âm Thanh Cafe & Acoustic</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Độ phủ âm thanh đều khắp mọi vị trí ngồi, âm lượng dễ chịu, nhạc nền chi tiết, mộc mạc.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0068ff] hover:underline"
              >
                Khám phá thiết bị <ArrowRight size={12} />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600 w-fit">
                <Radio size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Hội Trường & Sân Khấu</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Hệ thống loa Line Array, mixer kỹ thuật số, công suất lớn vận hành bền bỉ cho sự kiện.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
              >
                Đặt lịch khảo sát <ArrowRight size={12} />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 w-fit">
                <Headphones size={24} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Loa Kéo & Loa Di Động</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Loa kéo cao cấp bass uy lực, loa bluetooth di động tiện lợi cho các chuyến dã ngoại, picnic.
              </p>
              <Link
                href="/products?category=loa-keo"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                Xem các mẫu loa kéo <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Showroom Visit Quote & CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
                <Sparkles size={14} /> Mời bạn ghé nghe thử
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                “Điều quan trọng không phải là dàn máy đắt nhất, mà là âm thanh khiến bạn muốn ngồi lại nghe thêm một bài nữa.”
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                Showroom: <strong>{profile.address.formatted}</strong>
                <br />
                Giờ mở cửa: {profile.businessHours.join(' / ')} (Kể cả Thứ Bảy & Chủ Nhật)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[#b71c1c]"
              >
                Đặt lịch nghe thử ngay
                <ArrowRight size={16} />
              </Link>
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                <Phone size={16} />
                Hotline: {profile.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
