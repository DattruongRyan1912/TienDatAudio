'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, FileText, LayoutDashboard, LogOut, Menu, Package, Radio, Settings, Sparkles, Tags, Users, X } from 'lucide-react'
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
  { href: '/admin/assistant', label: 'Audio Assistant', icon: Bot },
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
    <div className="min-h-screen bg-[var(--sonic-canvas)] text-[var(--sonic-text)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-5 transition-transform lg:static lg:block lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[var(--sonic-line)] pb-6"><Link href="/admin" className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-[var(--sonic-gold)] text-[10px] font-black text-[var(--sonic-gold)]">TD</span><span><span className="block text-xs font-extrabold tracking-[0.15em]">ADMIN ARCHIVE</span><span className="mt-1 block text-[0.55rem] font-bold tracking-[0.2em] text-[var(--sonic-subtle)]">TIẾN ĐẠT AUDIO</span></span></Link><button type="button" className="text-[var(--sonic-muted)] lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={20} /></button></div>
        <nav className="mt-8 grid gap-1">{links.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== '/admin' && pathname.startsWith(href)); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${active ? 'bg-[var(--sonic-gold)] text-[var(--sonic-button-text)]' : 'text-[var(--sonic-muted)] hover:bg-[var(--sonic-surface-raised)] hover:text-[var(--sonic-text)]'}`}><Icon size={16} />{label}</Link> })}</nav>
        <div className="absolute inset-x-5 bottom-5 border-t border-[var(--sonic-line)] pt-5"><button type="button" onClick={logout} className="flex w-full items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-gold)]"><LogOut size={16} />Đăng xuất</button><Link href="/" className="mt-2 block px-3 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--sonic-subtle)] hover:text-[var(--sonic-gold)]">← Về website</Link></div>
      </aside>
      {open && <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
      <div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--sonic-line)] bg-[var(--sonic-surface)] px-5 backdrop-blur-md lg:px-8"><button type="button" className="text-[var(--sonic-text)] lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={21} /></button><div className="hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--sonic-subtle)] lg:block">Control room / {new Date().getFullYear()}</div><div className="ml-auto flex items-center gap-3"><ThemeToggle /><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs text-[var(--sonic-muted)]">Hệ thống đang hoạt động</span></div></header><main className="p-5 lg:p-8">{children}</main></div>
    </div>
  )
}
