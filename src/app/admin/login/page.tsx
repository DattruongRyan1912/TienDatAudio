'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Đăng nhập thất bại')
      window.location.href = '/admin'
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Đăng nhập thất bại')
    } finally { setLoading(false) }
  }

  return <div className="sonic-page sonic-grid-bg flex min-h-screen items-center justify-center px-5 py-10"><div className="grid w-full max-w-5xl overflow-hidden border border-white/10 bg-[#0d0d0d] lg:grid-cols-[.9fr_1.1fr]"><div className="relative hidden min-h-[560px] overflow-hidden border-r border-white/10 p-10 lg:block"><div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#d4af37]/10 blur-3xl" /><div className="relative flex h-full flex-col justify-between"><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989] hover:text-[#d4af37]"><ArrowLeft size={14} /> Về website</Link><div><p className="sonic-label">Sonic Purity / Control room</p><h1 className="mt-5 text-5xl font-bold leading-[.98] tracking-[-0.07em]">Quản lý trải nghiệm<br /><span className="text-[#d4af37]">nghe.</span></h1><p className="sonic-copy mt-6 max-w-sm text-sm">Quản lý catalog, yêu cầu tư vấn và nội dung của Tiến Đạt Audio trong một nơi.</p></div><p className="text-[0.62rem] uppercase tracking-[0.15em] text-[#606363]">Private area / Authenticated access</p></div></div><div className="p-7 sm:p-12 lg:p-16"><div className="mb-10 lg:hidden"><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989]"><ArrowLeft size={14} /> Về website</Link></div><p className="sonic-label">Admin sign in</p><h2 className="mt-4 text-3xl font-bold tracking-[-0.05em]">Chào mừng trở lại.</h2><p className="mt-3 text-sm text-[#858989]">Đăng nhập để tiếp tục quản lý hệ thống.</p><form onSubmit={submit} className="mt-10 grid gap-5"><label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Tên đăng nhập<div className="relative"><UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707474]" /><input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="sonic-input sonic-input-with-leading-icon" placeholder="admin" /></div></label><label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Mật khẩu<div className="relative"><LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707474]" /><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="sonic-input sonic-input-with-leading-icon sonic-input-with-trailing-icon" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707474] hover:text-[#d4af37]" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <p className="border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</p>}<button disabled={loading} type="submit" className="sonic-button sonic-button-gold mt-3 w-full">{loading ? 'Đang xác thực...' : 'Đăng nhập'}</button></form><p className="mt-8 text-center text-[0.65rem] leading-5 text-[#606363]">Credentials được đọc từ <code className="text-[#858989]">ADMIN_USERNAME</code> + <code className="text-[#858989]">ADMIN_PASSWORD_HASH</code>.</p></div></div></div>
}
