'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Phone, Search, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navItems = [
  { label: '🔥 Dàn Karaoke Bán Chạy', href: '/combos' },
  { label: 'Loa Karaoke & Nghe Nhạc', href: '/products?category=loa' },
  { label: 'Vang Số Chống Hú', href: '/products?category=vang-so' },
  { label: 'Cục Đẩy Công Suất', href: '/products?category=cuc-day' },
  { label: 'Loa Sub Siêu Trầm', href: '/products?category=loa-sub' },
  { label: 'Micro Không Dây', href: '/products?category=micro' },
  { label: 'Kiến Thức & Căn Chỉnh', href: '/kien-thuc' },
  ...(process.env.NEXT_PUBLIC_SOCIAL_HUB_ENABLED !== 'false' ? [{ label: 'Công Trình Thực Tế', href: '/bai-viet' }] : []),
]

export default function SonicHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    setMobileMenuOpen(false)
    router.push(`/tim-kiem?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#d32f2f] bg-white shadow-sm">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#0f172a] py-1.5 text-xs text-[#cbd5e1]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-2 px-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span>📍 Showroom: <strong className="text-white">264 Phan Đình Phùng, TP Quảng Ngãi</strong></span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span className="hidden sm:inline">🚚 <strong className="text-white">Miễn phí lắp đặt tận nhà</strong> bán kính 30km (Bình Sơn, Tư Nghĩa, Mộ Đức...)</span>
          </div>
          <div className="text-[11px] sm:text-xs">
            <span>📞 Hotline Kỹ Thuật: <a href="tel:0934995657" className="font-bold text-[#f59e0b] hover:underline">0934 995 657</a> (24/7)</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="mx-auto max-w-[1240px] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Tiến Đạt Audio - Trang chủ">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d32f2f] text-xl font-black text-white shadow-md shadow-[#d32f2f]/30">
              TĐ
            </div>
            <div>
              <span className="block text-lg font-black uppercase tracking-tight text-slate-900 sm:text-xl">
                Tiến Đạt Audio
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Âm Thanh & Dàn Karaoke Quảng Ngãi
              </span>
            </div>
          </Link>

          {/* Search Box (Desktop & Tablet) */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-[480px] lg:flex">
            <div className="flex w-full overflow-hidden rounded-md border-2 border-[#d32f2f] bg-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm dàn karaoke gia đình, vang số, loa sub, micro..."
                aria-label="Tìm kiếm sản phẩm"
                className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex items-center gap-1.5 bg-[#d32f2f] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#b71c1c]"
              >
                <Search size={15} />
                <span>Tìm Kiếm</span>
              </button>
            </div>
          </form>

          {/* Hotline & Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="tel:0934995657"
              className="flex items-center gap-2.5 rounded-full border border-[#ffcdd2] bg-[#ffebee] px-3.5 py-1.5 transition-transform hover:scale-105"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#d32f2f] text-white">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d32f2f] opacity-75"></span>
                <Phone size={15} className="relative z-10" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-slate-600">Tư vấn báo giá</span>
                <strong className="block text-sm font-black text-[#d32f2f] sm:text-base">0934.995.657</strong>
              </div>
            </a>

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSearch} className="mt-2.5 flex lg:hidden">
          <div className="flex w-full overflow-hidden rounded-md border-2 border-[#d32f2f] bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm loa, vang số, dàn karaoke..."
              aria-label="Tìm kiếm sản phẩm trên di động"
              className="w-full px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="flex items-center justify-center bg-[#d32f2f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#b71c1c]"
            >
              <Search size={14} />
              <span className="sr-only">Tìm kiếm</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Main Navigation Bar */}
      <div className="hidden border-t border-slate-100 bg-white lg:block">
        <div className="mx-auto max-w-[1240px] px-4">
          <nav className="flex items-center gap-1 overflow-x-auto py-1 text-sm font-semibold whitespace-nowrap">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#ffebee] text-[#d32f2f]'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#d32f2f]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 4. Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 shadow-xl lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-xs font-bold text-slate-800 hover:bg-[#ffebee] hover:text-[#d32f2f]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://zalo.me/0934995657"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#0068ff] py-2.5 text-xs font-bold text-white shadow"
            >
              Chat Zalo Báo Giá Ngay
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
