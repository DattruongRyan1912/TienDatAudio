/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { SocialMediaItem } from '@/modules/social/domain/types'

export default function SocialLightbox({ media, index, onClose }: { media: SocialMediaItem[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index)
  const reduceMotion = useReducedMotion()
  const item = media[current]

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setCurrent((value) => (value - 1 + media.length) % media.length)
      if (event.key === 'ArrowRight') setCurrent((value) => (value + 1) % media.length)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [media.length, onClose])

  if (!item) return null
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24 }} className="sonic-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Thư viện hình ảnh" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Đóng thư viện"><X size={20} /></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); setCurrent((value) => (value - 1 + media.length) % media.length) }} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8" aria-label="Ảnh trước"><ChevronLeft size={24} /></button>
      <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduceMotion ? 0 : 0.24 }} className="sonic-lightbox-content flex max-h-[88vh] max-w-6xl flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
        {item.type === 'video' ? <video src={item.url} poster={item.thumbnailUrl || undefined} controls autoPlay className="max-h-[78vh] max-w-full" /> : <img src={item.url} alt={item.alt} className="max-h-[78vh] max-w-full object-contain" />}
        <p className="text-xs text-white/70">{current + 1} / {media.length}</p>
      </motion.div>
      <button type="button" onClick={(event) => { event.stopPropagation(); setCurrent((value) => (value + 1) % media.length) }} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8" aria-label="Ảnh tiếp theo"><ChevronRight size={24} /></button>
    </motion.div>
  )
}
