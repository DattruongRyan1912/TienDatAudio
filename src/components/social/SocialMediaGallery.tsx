/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import { getSocialMediaLayout } from '@/modules/social/domain/media-layout'
import type { SocialMediaItem } from '@/modules/social/domain/types'
import SocialLightbox from './SocialLightbox'

export default function SocialMediaGallery({ media }: { media: SocialMediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  if (!media.length) return null
  const layout = getSocialMediaLayout(media)
  const visible = media.slice(0, layout === 'overflow-grid' ? 4 : media.length)
  const remaining = media.length - visible.length

  return (
    <>
      <div className={`social-media-gallery social-media-gallery-${layout} mt-5 overflow-hidden rounded-lg border border-[var(--sonic-line)]`}>
        {visible.map((item, index) => {
          const isImage = item.type === 'image'
          const content = isImage ? <img src={item.url} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:opacity-90" /> : item.type === 'video' ? <div className="relative h-full w-full bg-black"><video src={item.url} poster={item.thumbnailUrl || undefined} preload="metadata" controls className="h-full w-full object-contain" /><span className="sonic-media-badge pointer-events-none absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full p-0"><Play size={14} fill="currentColor" /></span></div> : <iframe src={item.url} title={item.alt} loading="lazy" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          return <div key={item.id} className="group relative min-h-[160px] overflow-hidden bg-[var(--sonic-surface-raised)] sonic-media-surface">{isImage ? <button type="button" className="h-full w-full cursor-zoom-in text-left" onClick={() => setLightboxIndex(index)} aria-label={`Mở hình ảnh ${index + 1}`}>{content}</button> : content}{remaining > 0 && index === visible.length - 1 && <button type="button" onClick={() => setLightboxIndex(index)} className="sonic-media-action absolute inset-0 flex items-center justify-center text-2xl font-bold transition" aria-label={`Mở thư viện, còn ${remaining} hình ảnh`}>+{remaining}</button>}</div>
        })}
      </div>
      <AnimatePresence initial={false}>{lightboxIndex !== null && <SocialLightbox media={media} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}</AnimatePresence>
    </>
  )
}
