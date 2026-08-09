'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { SONIC_MOTION, SONIC_REVEAL_EASE } from './sonic-motion'

const navigation = [
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Thương hiệu', href: '/brands' },
  { label: 'Giải pháp', href: '/about#solutions' },
  { label: 'Dự án', href: '/about#projects' },
  ...(process.env.NEXT_PUBLIC_SOCIAL_HUB_ENABLED !== 'false' ? [{ label: 'Góc Audio', href: '/bai-viet' }] : []),
  { label: 'Kiến thức', href: '/kien-thuc' },
  { label: 'Về chúng tôi', href: '/about' },
]

export default function SonicHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = search.trim()
    if (!query) return
    setMenuOpen(false)
    setSearchOpen(false)
    router.push(`/tim-kiem?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <div className="sonic-panel mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group flex min-w-[164px] items-center gap-3" aria-label="Tiến Đạt Audio - Trang chủ">
          <span className="flex h-8 w-8 items-center justify-center border border-[#d4af37] text-[10px] font-black text-[#d4af37]">TD</span>
          <span className="leading-none">
            <span className="block text-[0.76rem] font-extrabold tracking-[0.17em] text-[#e5e2e1] transition-colors group-hover:text-[#d4af37]">AUDIO ARCHIVE</span>
            <span className="mt-1 block text-[0.55rem] font-bold tracking-[0.28em] text-[#858989]">TIẾN ĐẠT AUDIO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Điều hướng chính">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href === '/brands' && pathname?.startsWith('/thuong-hieu'))
            return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`relative pb-1 text-[0.64rem] font-bold uppercase tracking-[0.14em] transition-colors hover:text-[#d4af37] ${active ? 'text-[#d4af37] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#d4af37]' : 'text-[#a7aaaa]'}`}>
              {item.label}
            </Link>
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" className="flex h-9 w-9 items-center justify-center text-[#a7aaaa] transition-colors hover:text-[#d4af37]" aria-label="Tìm kiếm" onClick={() => setSearchOpen((value) => !value)}>
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>
          <ThemeToggle />
          <Link href="/contact" className="sonic-header-consultation sonic-button sonic-button-gold min-h-9 px-4 text-[0.62rem]">Nhận tư vấn</Link>
          <button type="button" className="flex h-9 w-9 items-center justify-center text-[#e5e2e1] lg:hidden" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence initial={false}>{searchOpen && (
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: SONIC_MOTION.interaction, ease: SONIC_REVEAL_EASE }} onSubmit={submitSearch} className="sonic-motion-panel absolute inset-x-3 top-[calc(100%+8px)] flex gap-2 border border-white/10 bg-[#0d0d0d] p-2 md:inset-x-auto md:right-0 md:w-[360px]">
            <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm loa, ampli, thương hiệu..." className="sonic-input h-10 text-sm" aria-label="Từ khóa tìm kiếm" />
            <button type="submit" className="sonic-button sonic-button-gold h-10 min-h-10 px-3" aria-label="Thực hiện tìm kiếm"><Search size={15} /></button>
          </motion.form>
        )}</AnimatePresence>
      </div>

      <AnimatePresence initial={false}>{menuOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: SONIC_MOTION.interaction, ease: SONIC_REVEAL_EASE }} className="sonic-motion-panel sonic-panel mx-auto mt-2 max-w-[1440px] p-4 lg:hidden">
          <nav className="grid gap-1" aria-label="Điều hướng di động">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-white/10 px-2 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#c4c7c7] last:border-0 hover:text-[#d4af37]">{item.label}</Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="sonic-button sonic-button-gold mt-3">Nhận tư vấn</Link>
          </nav>
        </motion.div>
      )}</AnimatePresence>
    </header>
  )
}
