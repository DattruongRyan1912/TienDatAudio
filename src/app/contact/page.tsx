import Image from 'next/image'
import { Clock3, Mail, MapPin, Phone } from 'lucide-react'
import SonicContactForm from '@/components/sonic/SonicContactForm'
import { getSettings } from '@/lib/catalog'

export const metadata = { title: 'Đặt lịch trải nghiệm — Tiến Đạt Audio', description: 'Gửi nhu cầu để nhận tư vấn phối ghép âm thanh từ Tiến Đạt Audio.' }

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams])
  return (
    <div className="sonic-page pt-28 md:pt-36">
      <section className="sonic-container pb-12 md:pb-20"><p className="sonic-label">Contact / Listening appointment</p><h1 className="sonic-title mt-5 max-w-4xl">Hãy bắt đầu bằng một cuộc trò chuyện.</h1><p className="sonic-copy mt-6 max-w-xl">Cho chúng tôi biết bạn đang nghe gì, ở đâu và mong muốn điều gì. Một cấu hình phù hợp luôn bắt đầu từ những thông tin rất cụ thể.</p></section>
      <section className="border-y border-white/10 bg-[#0d0d0d] py-12 md:py-16"><div className="sonic-container grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-16"><SonicContactForm product={params.product} /><div className="relative min-h-[500px] overflow-hidden border border-white/10"><Image src="/images/sonic-hero.png" alt="Không gian nghe thử tại Tiến Đạt Audio" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/35 to-transparent" /><div className="absolute inset-x-6 bottom-6"><p className="sonic-label">Showroom / Quảng Ngãi</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#e5e2e1]">Đến để nghe.<br />Ở lại vì sự phù hợp.</h2></div></div></div></section>
      <section className="sonic-container grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4 md:py-20">{[[MapPin, 'Địa chỉ', settings.address], [Phone, 'Điện thoại', settings.contactPhone], [Mail, 'Email', settings.contactEmail], [Clock3, 'Giờ mở cửa', settings.businessHours]].map(([Icon, label, value]) => { const Component = Icon as typeof MapPin; return <div key={label as string} className="border-t border-white/15 pt-5"><Component size={18} className="text-[#d4af37]" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#858989]">{label as string}</p><p className="mt-2 text-sm leading-6 text-[#c4c7c7]">{value as string}</p></div> })}</section>
    </div>
  )
}

