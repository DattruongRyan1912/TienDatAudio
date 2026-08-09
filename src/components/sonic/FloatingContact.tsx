import Link from 'next/link'
import { MessageCircle, Phone } from 'lucide-react'
import type { BusinessProfile } from '@/lib/business-profile'

export default function FloatingContact({ profile }: { profile: BusinessProfile }) {
  const phone = profile.phone.replace(/\D/g, '')
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2 md:bottom-8 md:right-7" aria-label="Liên hệ nhanh">
      <a href={`tel:${phone}`} data-analytics-event="phone_click" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37] bg-[#d4af37] text-[#080808] shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-transform hover:-translate-y-1" aria-label={`Gọi ${profile.name}`}><Phone size={17} /></a>
      <a href={`https://zalo.me/${phone}`} data-analytics-event="zalo_click" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-xs font-black text-[#e5e2e1] transition-all hover:-translate-y-1 hover:border-[#d4af37] hover:text-[#d4af37]" aria-label="Nhắn Zalo">Z</a>
      <Link href="/contact" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-[#e5e2e1] transition-all hover:-translate-y-1 hover:border-[#d4af37] hover:text-[#d4af37]" aria-label="Gửi yêu cầu tư vấn"><MessageCircle size={17} /></Link>
    </div>
  )
}
