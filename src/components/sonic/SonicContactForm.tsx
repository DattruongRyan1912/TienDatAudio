'use client'

import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'

type FormState = { name: string; phone: string; email: string; interest: string; budget: string; message: string }

export default function SonicContactForm({ product }: { product?: string }) {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', interest: product || '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  function update(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })) }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, source: 'contact-page' }) })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Không thể gửi yêu cầu')
      setStatus('success')
      setForm({ name: '', phone: '', email: '', interest: '', budget: '', message: '' })
    } catch (submitError) {
      setStatus('error')
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi yêu cầu')
    }
  }

  if (status === 'success') return <div className="sonic-panel flex min-h-[500px] flex-col items-center justify-center p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37] text-[#080808]"><Check size={24} /></span><p className="sonic-label mt-7">Yêu cầu đã được ghi nhận</p><h2 className="mt-4 text-3xl font-bold tracking-[-0.05em]">Chúng tôi sẽ liên hệ sớm.</h2><p className="sonic-copy mt-4 max-w-md text-sm">Đội ngũ Tiến Đạt Audio sẽ gọi lại để hiểu rõ nhu cầu và sắp xếp lịch phù hợp.</p><button type="button" onClick={() => setStatus('idle')} className="sonic-button sonic-button-ghost mt-8">Gửi yêu cầu khác</button></div>

  return (
    <form onSubmit={submit} className="sonic-panel p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Họ và tên *<input required value={form.name} onChange={(event) => update('name', event.target.value)} className="sonic-input mt-1 normal-case tracking-normal" placeholder="Nguyễn Văn A" /></label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Số điện thoại *<input required value={form.phone} onChange={(event) => update('phone', event.target.value)} className="sonic-input mt-1 normal-case tracking-normal" placeholder="0934 995 657" /></label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="sonic-input mt-1 normal-case tracking-normal" placeholder="email@example.com" /></label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2]">Bạn quan tâm đến<input value={form.interest} onChange={(event) => update('interest', event.target.value)} className="sonic-input mt-1 normal-case tracking-normal" placeholder="Loa, karaoke, phòng nghe..." /></label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2] sm:col-span-2">Ngân sách dự kiến<select value={form.budget} onChange={(event) => update('budget', event.target.value)} className="sonic-input mt-1"><option value="">Chọn khoảng ngân sách</option><option>Dưới 10 triệu</option><option>10 — 30 triệu</option><option>30 — 70 triệu</option><option>Trên 70 triệu</option></select></label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9ea2a2] sm:col-span-2">Ghi chú<textarea value={form.message} onChange={(event) => update('message', event.target.value)} className="sonic-input mt-1 min-h-32 resize-y normal-case tracking-normal" placeholder="Mô tả không gian hoặc điều bạn đang tìm kiếm..." /></label>
      </div>
      {status === 'error' && <p className="mt-5 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</p>}
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xs text-xs leading-5 text-[#707474]">Thông tin của bạn chỉ được sử dụng để tư vấn và sắp xếp lịch trải nghiệm.</p><button disabled={status === 'loading'} type="submit" className="sonic-button sonic-button-gold">{status === 'loading' ? 'Đang gửi...' : 'Gửi yêu cầu'} <ArrowUpRight size={16} /></button></div>
    </form>
  )
}

