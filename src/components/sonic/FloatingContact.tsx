'use client'

import Link from 'next/link'
import { MessageCircle, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { BusinessProfile } from '@/lib/business-profile'
import { SONIC_MOTION, SONIC_REVEAL_EASE } from './sonic-motion'

export default function FloatingContact({ profile }: { profile: BusinessProfile }) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const phone = profile.phone.replace(/\D/g, '')

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2 md:bottom-8 md:right-7" aria-label="Liên hệ nhanh">
      <AnimatePresence initial={false}>{open && (
        <motion.div id="quick-contact-options" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: 8 }} transition={{ duration: reduceMotion ? 0 : SONIC_MOTION.interaction, ease: SONIC_REVEAL_EASE }} className="sonic-motion-panel sonic-panel grid gap-1 p-2" role="group" aria-label="Các kênh liên hệ">
          <motion.a initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} href={`tel:${phone}`} data-analytics-event="phone_click" className="flex min-h-10 items-center gap-3 px-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] transition-colors hover:text-[var(--sonic-gold)]" aria-label={`Gọi ${profile.name}`}><Phone size={15} /> Gọi</motion.a>
          <motion.a initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.04 }} href={`https://zalo.me/${phone}`} data-analytics-event="zalo_click" target="_blank" rel="noreferrer" className="flex min-h-10 items-center gap-3 px-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] transition-colors hover:text-[var(--sonic-gold)]" aria-label="Nhắn Zalo"><span className="text-sm font-black">Z</span> Zalo</motion.a>
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.08 }}><Link href="/contact" className="flex min-h-10 items-center gap-3 px-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] transition-colors hover:text-[var(--sonic-gold)]" aria-label="Gửi yêu cầu tư vấn"><MessageCircle size={15} /> Nhắn tin</Link></motion.div>
        </motion.div>
      )}</AnimatePresence>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="quick-contact-options" aria-label={open ? 'Đóng liên hệ nhanh' : 'Mở liên hệ nhanh'} className="flex h-12 w-12 items-center justify-center border border-[var(--sonic-gold)] bg-[var(--sonic-gold)] text-[var(--sonic-button-text)] shadow-[0_0_20px_var(--sonic-gold-soft)] transition-transform hover:-translate-y-1">
        {open ? <X size={18} /> : <Phone size={17} />}
      </button>
    </div>
  )
}
