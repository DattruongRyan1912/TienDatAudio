import Link from 'next/link'
import type { BusinessProfile } from '@/lib/business-profile'
import { isSocialHubEnabled } from '@/modules/social/domain/feature-flag'

const productLinks = [
  ['Loa hi-end', '/products?category=loa-thung'],
  ['Loa trầm', '/products?category=loa-tram'],
  ['Vang số', '/products?category=vang-so'],
  ['Thương hiệu', '/brands'],
]

export default function SonicFooter({ profile }: { profile: BusinessProfile }) {
  const phoneDigits = profile.phone.replace(/\D/g, '')
  const phoneDisplay = phoneDigits.length === 10 ? `${phoneDigits.slice(0, 4)} ${phoneDigits.slice(4, 7)} ${phoneDigits.slice(7)}` : profile.phone
  return (
    <footer className="border-t border-[var(--sonic-line)] bg-[var(--sonic-canvas)]">
      <div className="sonic-container grid gap-16 py-20 md:grid-cols-[1.35fr_.85fr_.85fr_1.45fr] md:py-28">
        <div>
          <p className="sonic-label">{profile.name} / 01</p>
          <h2 className="mt-5 max-w-sm text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text-strong)]">Âm thanh được tuyển chọn cho những không gian đáng nhớ.</h2>
          <p className="sonic-copy mt-5 max-w-sm text-sm">Tư vấn, phối ghép và triển khai hệ thống âm thanh tại Quảng Ngãi và khu vực miền Trung.</p>
        </div>
        <div>
          <p className="sonic-label">Điều hướng</p>
          <div className="mt-5 grid gap-3 text-sm text-[var(--sonic-muted)]">
            <Link href="/products" className="transition-colors hover:text-[#d4af37]">Sản phẩm</Link>
            <Link href="/about#solutions" className="transition-colors hover:text-[#d4af37]">Giải pháp</Link>
            <Link href="/kien-thuc" className="transition-colors hover:text-[#d4af37]">Kiến thức</Link>
            {isSocialHubEnabled() && <Link href="/bai-viet" className="transition-colors hover:text-[#d4af37]">Góc Audio</Link>}
            <Link href="/contact" className="transition-colors hover:text-[#d4af37]">Liên hệ</Link>
          </div>
        </div>
        <div>
          <p className="sonic-label">Danh mục</p>
          <div className="mt-5 grid gap-3 text-sm text-[var(--sonic-muted)]">
            {productLinks.map(([label, href]) => <Link key={href} href={href} className="transition-colors hover:text-[#d4af37]">{label}</Link>)}
          </div>
        </div>
        <div>
          <p className="sonic-label">Showroom</p>
          <p className="mt-5 text-sm leading-7 text-[var(--sonic-muted)]">{profile.address.formatted}</p>
          <a href={`tel:${phoneDigits}`} data-analytics-event="phone_click" className="mt-4 inline-block text-lg font-bold text-[#d4af37]">{phoneDisplay}</a>
          <p className="mt-2 text-xs text-[var(--sonic-subtle)]">{profile.businessHours.join(' / ')}</p>
          <p className="mt-6 sonic-label text-[#858989]">Vị trí showroom</p>
          <div className="sonic-map-frame relative mt-3 h-44 overflow-hidden border border-[var(--sonic-line)] bg-[var(--sonic-surface)] sm:h-48 md:h-40 lg:h-44">
            <iframe src={profile.mapEmbedUrl} width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" title={`Bản đồ ${profile.name}`} />
          </div>
          <a href={profile.mapUrl} data-analytics-event="map_click" target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-[#d4af37] transition-colors hover:text-[#e5c45a]">Mở bản đồ <span aria-hidden="true" className="ml-2">↗</span></a>
        </div>
      </div>
      <div className="sonic-container flex flex-col gap-3 border-t border-[var(--sonic-line)] py-6 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--sonic-subtle)] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Sonic Purity / Designed for listening</span>
      </div>
    </footer>
  )
}
