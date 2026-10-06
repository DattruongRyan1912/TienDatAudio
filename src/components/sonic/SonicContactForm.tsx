'use client'

import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { getAttributionContext, trackSiteEvent } from '@/components/analytics/SiteAnalytics'

type FormState = { name: string; phone: string; email: string; interest: string; budget: string; message: string }

export default function SonicContactForm({ product, productId, articleId }: { product?: string; productId?: string; articleId?: string }) {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', interest: product || '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  function update(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })) }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const attribution = getAttributionContext()
      trackSiteEvent('contact_submit', { productId })
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, source: product ? 'product-page' : articleId ? 'article-page' : 'contact-page', attribution: { ...attribution, productId, articleId } }) })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Không thể gửi yêu cầu')
      setStatus('success')
      setForm({ name: '', phone: '', email: '', interest: '', budget: '', message: '' })
    } catch (submitError) {
      setStatus('error')
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi yêu cầu')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <Check size={28} />
        </span>
        <span className="mt-6 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-800">
          ĐÃ TIẾP NHẬN YÊU CẦU
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Tiến Đạt Audio sẽ liên hệ lại ngay
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Cảm ơn quý khách. Kỹ thuật viên của chúng tôi sẽ gọi điện hoặc nhắn Zalo trong vòng 15 phút để tư vấn và sắp xếp lịch nghe thử tại showroom.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Thông tin liên hệ & Đặt lịch</h2>
        <p className="mt-1 text-xs text-slate-500">
          Vui lòng để lại thông tin, đội ngũ kỹ thuật sẽ gọi lại tư vấn cấu hình phù hợp với diện tích phòng và ngân sách của bạn.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label htmlFor="contact-name" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Họ và tên <span className="text-[#d32f2f]">*</span></span>
          <input
            id="contact-name"
            name="name"
            required
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Nguyễn Văn A"
          />
        </label>

        <label htmlFor="contact-phone" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Số điện thoại <span className="text-[#d32f2f]">*</span></span>
          <input
            id="contact-phone"
            name="phone"
            required
            type="tel"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="0934 995 657"
          />
        </label>

        <label htmlFor="contact-email" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Email</span>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="email@example.com"
          />
        </label>

        <label htmlFor="contact-interest" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Sản phẩm / Nhu cầu quan tâm</span>
          <input
            id="contact-interest"
            name="interest"
            value={form.interest}
            onChange={(event) => update('interest', event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Dàn karaoke, loa bluetooth, loa kéo, mixer..."
          />
        </label>

        <label htmlFor="contact-budget" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
          <span>Ngân sách dự kiến</span>
          <select
            id="contact-budget"
            name="budget"
            aria-label="Ngân sách dự kiến"
            value={form.budget}
            onChange={(event) => update('budget', event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <option value="">Chọn khoảng ngân sách phù hợp</option>
            <option>Dưới 10 triệu</option>
            <option>10 — 30 triệu (Phổ thông - Gia đình)</option>
            <option>30 — 70 triệu (Cao cấp - Kinh doanh)</option>
            <option>Trên 70 triệu (Sân khấu - Sự kiện chuyên nghiệp)</option>
          </select>
        </label>

        <label htmlFor="contact-message" className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
          <span>Ghi chú / Yêu cầu thêm</span>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#d32f2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Mô tả diện tích phòng, sở thích nghe nhạc hoặc ngày giờ muốn ghé showroom nghe thử..."
          />
        </label>
      </div>

      {status === 'error' && (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          Thông tin của bạn được bảo mật tuyệt đối, chỉ dùng để kỹ thuật viên tư vấn báo giá.
        </p>
        <button
          disabled={status === 'loading'}
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d32f2f] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b71c1c] active:scale-[0.98] disabled:opacity-60"
        >
          {status === 'loading' ? 'Đang gửi thông tin...' : 'Gửi yêu cầu tư vấn'}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </form>
  )
}
