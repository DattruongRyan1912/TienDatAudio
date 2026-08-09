'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LayoutDashboard, LogOut, Menu, Package, Radio, Settings, Sparkles, Tags, Users, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const links = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: Tags },
  { href: '/admin/brands', label: 'Thương hiệu', icon: Tags },
  { href: '/admin/posts', label: 'Bài viết', icon: FileText },
  { href: '/admin/social-posts', label: 'Góc Audio', icon: Radio },
  { href: '/admin/contacts', label: 'Yêu cầu tư vấn', icon: Users },
  { href: '/admin/seo/strategy', label: 'Keyword + GEO/AIO', icon: Sparkles },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export default function SonicAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#e5e2e1] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#0d0d0d] p-5 transition-transform lg:static lg:block lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-6"><Link href="/admin" className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-[#d4af37] text-[10px] font-black text-[#d4af37]">TD</span><span><span className="block text-xs font-extrabold tracking-[0.15em]">ADMIN ARCHIVE</span><span className="mt-1 block text-[0.55rem] font-bold tracking-[0.2em] text-[#707474]">TIẾN ĐẠT AUDIO</span></span></Link><button type="button" className="text-[#858989] lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={20} /></button></div>
        <nav className="mt-8 grid gap-1">{links.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== '/admin' && pathname.startsWith(href)); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${active ? 'bg-[#d4af37] text-[#080808]' : 'text-[#9ea2a2] hover:bg-white/5 hover:text-[#e5e2e1]'}`}><Icon size={16} />{label}</Link> })}</nav>
        <div className="absolute inset-x-5 bottom-5 border-t border-white/10 pt-5"><button type="button" onClick={logout} className="flex w-full items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#858989] transition-colors hover:text-[#d4af37]"><LogOut size={16} />Đăng xuất</button><Link href="/" className="mt-2 block px-3 text-[0.62rem] uppercase tracking-[0.14em] text-[#606363] hover:text-[#d4af37]">← Về website</Link></div>
      </aside>
      {open && <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
      <div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080808]/90 px-5 backdrop-blur-md lg:px-8"><button type="button" className="text-[#e5e2e1] lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={21} /></button><div className="hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#707474] lg:block">Control room / {new Date().getFullYear()}</div><div className="ml-auto flex items-center gap-3"><ThemeToggle /><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs text-[#9ea2a2]">Hệ thống đang hoạt động</span></div></header><main className="p-5 lg:p-8">{children}</main></div>
    </div>
  )
}
