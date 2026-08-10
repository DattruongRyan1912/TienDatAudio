import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getBusinessProfile } from '@/lib/business-profile'
import { getSEOConfig } from '@/lib/seo-strategy'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/faq',
  title: 'Câu hỏi thường gặp — Tiến Đạt Audio',
  description: 'Các câu hỏi thường gặp về tư vấn, nghe thử, phối ghép và lắp đặt âm thanh tại Tiến Đạt Audio.',
})
export const revalidate = 300

export default async function FAQPage() {
  const [config, profile] = await Promise.all([getSEOConfig(), getBusinessProfile()])
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.ai.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  }
  return <div className="sonic-page pt-28 md:pt-36"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><section className="sonic-container pb-16"><p className="sonic-label">FAQ / Verified answers</p><h1 className="sonic-title mt-5 max-w-4xl">Những câu hỏi thường gặp trước khi nghe thử và lựa chọn.</h1><p className="sonic-copy mt-6 max-w-2xl">Thông tin trên trang này cũng là nguồn công khai cho llms.txt. Giá, tồn kho và cấu hình cụ thể luôn được xác nhận theo thời điểm tư vấn.</p></section><section className="border-y border-white/10 bg-[#0d0d0d] py-12 md:py-16"><div className="sonic-container mx-auto max-w-4xl">{config.ai.faqs.length ? config.ai.faqs.map((faq) => <details key={faq.id} className="group border-b border-white/10 py-6"><summary className="cursor-pointer list-none text-lg font-bold text-[#e5e2e1]">{faq.question}</summary><p className="mt-4 max-w-3xl text-sm leading-7 text-[#9ea2a2]">{faq.answer}</p></details>) : <p className="text-sm text-[#858989]">FAQ đang được biên tập.</p>}</div></section><section className="sonic-container py-16"><p className="sonic-label">Cần câu trả lời riêng cho không gian của bạn?</p><Link href="/contact" className="sonic-button sonic-button-gold mt-5">Trao đổi với {profile.name} <ArrowUpRight size={15} /></Link></section></div>
}
