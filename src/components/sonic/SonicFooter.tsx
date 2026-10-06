import Link from 'next/link'
import { MapPin, Clock3, Mail } from 'lucide-react'
import type { BusinessProfile } from '@/lib/business-profile'
import { isSocialHubEnabled } from '@/modules/social/domain/feature-flag'
import SonicDeferredMap from './SonicDeferredMap'

const productLinks = [
  ['Dàn karaoke gia đình', '/combos'],
  ['Loa karaoke & Nghe nhạc', '/products?category=loa'],
  ['Vang số & Mixer chống hú', '/products?category=vang-so'],
  ['Cục đẩy công suất', '/products?category=cuc-day'],
  ['Loa Sub siêu trầm', '/products?category=loa-sub'],
  ['Micro không dây', '/products?category=micro'],
  ['Thương hiệu phân phối', '/brands'],
]

const serviceLinks = [
  ['Về Tiến Đạt Audio', '/about'],
  ['Tư vấn âm thanh Quảng Ngãi', '/loa-quang-ngai'],
  ['Kiến thức & Cân chỉnh', '/kien-thuc'],
  ['Câu hỏi thường gặp (FAQ)', '/faq'],
  ['Liên hệ & Đặt lịch', '/contact'],
]

export default function SonicFooter({ profile }: { profile: BusinessProfile }) {
  const phoneDigits = profile.phone.replace(/\D/g, '')
  const phoneDisplay =
    phoneDigits.length === 10
      ? `${phoneDigits.slice(0, 4)} ${phoneDigits.slice(4, 7)} ${phoneDigits.slice(7)}`
      : profile.phone

  return (
    <footer className="border-t border-slate-800 bg-[#0f172a] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Col 1: Brand & Intro (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d32f2f] text-xl font-black text-white shadow-md shadow-red-900/40">
                TĐ
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  Tiến Đạt Audio
                </h3>
                <p className="text-xs text-slate-400">Chuyên gia âm thanh tại Quảng Ngãi</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Hơn 10 năm kinh nghiệm tư vấn, phối ghép và triển khai hệ thống âm thanh gia đình, phòng karaoke, cafe và sân khấu sự kiện. Cam kết 100% chính hãng, bảo hành minh bạch.
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400">Hotline tư vấn 24/7:</span>
              <div className="mt-1 flex items-center gap-3">
                <a
                  href={`tel:${phoneDigits}`}
                  data-analytics-event="phone_click"
                  className="text-xl font-black text-[#f59e0b] hover:text-amber-300 transition-colors"
                >
                  {phoneDisplay}
                </a>
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#0068ff] px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#0052cc]"
                >
                  Chat Zalo
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Categories (3 cols) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Danh mục thiết bị
            </h4>
            <ul className="space-y-2 text-xs">
              {productLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 transition-colors hover:text-white hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation & Policy (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Dịch vụ & Hỗ trợ
            </h4>
            <ul className="space-y-2 text-xs">
              {serviceLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 transition-colors hover:text-white hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {isSocialHubEnabled() && (
                <li>
                  <Link
                    href="/bai-viet"
                    className="text-slate-400 transition-colors hover:text-white hover:underline"
                  >
                    Góc Audio & Dự án
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Showroom & Map (3 cols) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Showroom Quảng Ngãi
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-[#d32f2f] shrink-0 mt-0.5" />
                <span>{profile.address.formatted}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={15} className="text-amber-400 shrink-0" />
                <span>{profile.businessHours.join(' / ')}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <span>{profile.email}</span>
              </p>
            </div>

            <div className="pt-2">
              <SonicDeferredMap embedUrl={profile.mapEmbedUrl} name={profile.name} />
              <a
                href={profile.mapUrl}
                data-analytics-event="map_click"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
              >
                Chỉ đường trên Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {profile.name}. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Đại lý âm thanh chính hãng tại Quảng Ngãi</span>
            <span>•</span>
            <Link href="/faq" className="hover:text-slate-400">Chính sách bảo hành</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-400">Hỗ trợ kỹ thuật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
