import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Phone,
  Sparkles,
} from 'lucide-react'
import { getBusinessProfile, formatPhoneHref } from '@/lib/business-profile'
import { getSEOConfig } from '@/lib/seo-strategy'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/faq',
  title: 'Câu hỏi thường gặp — Tiến Đạt Audio',
  description:
    'Giải đáp các câu hỏi thường gặp về tư vấn phối ghép, nghe thử, chính sách bảo hành và lắp đặt âm thanh tại Tiến Đạt Audio Quảng Ngãi.',
  keywords: [
    'hỏi đáp âm thanh',
    'faq tiến đạt audio',
    'tư vấn loa quảng ngãi',
    'bảo hành âm thanh tiến đạt',
  ],
})

export const revalidate = 300

export default async function FAQPage() {
  const [config, profile] = await Promise.all([getSEOConfig(), getBusinessProfile()])
  const phoneHref = formatPhoneHref(profile.phone)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.ai.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-20 md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#d32f2f] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Câu hỏi thường gặp (FAQ)</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
            <HelpCircle size={14} /> Trung tâm giải đáp
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Các Câu Hỏi Thường Gặp
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tổng hợp những câu hỏi phổ biến nhất của khách hàng về kỹ thuật âm thanh, cách chọn loa, phối ghép amply và chính sách lắp đặt tại Tiến Đạt Audio.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {config.ai.faqs.length > 0 ? (
            config.ai.faqs.map((faq, index) => (
              <details
                key={faq.id || index}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 open:ring-1 open:ring-red-200 open:border-red-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900 transition-colors group-hover:text-[#d32f2f]">
                  <span className="text-base leading-snug">{faq.question}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-transform duration-200 group-open:rotate-180 group-open:bg-red-50 group-open:text-[#d32f2f]">
                    <ChevronDown size={16} />
                  </span>
                </summary>
                <div className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </div>
              </details>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Nội dung FAQ đang được cập nhật thêm.
            </div>
          )}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 rounded-3xl border border-red-200 bg-red-50/70 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
                <Sparkles size={14} /> Bạn có câu hỏi khác?
              </span>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Cần tư vấn trực tiếp theo diện tích không gian thực tế?
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Hãy gọi trực tiếp cho chúng tôi hoặc kết nối Zalo để được giải đáp tức thì.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d32f2f] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#b71c1c]"
              >
                <Phone size={14} />
                Gọi {profile.phone}
              </a>
              <a
                href="https://zalo.me/0934995657"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0052cc]"
              >
                <MessageCircle size={14} />
                Chat Zalo
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Đặt lịch showroom
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
