/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import { getSocialMediaLayout } from '@/modules/social/domain/media-layout'
import type { SocialMediaItem } from '@/modules/social/domain/types'
import SocialLightbox from './SocialLightbox'

const CLOUDINARY_WIDTHS = [256, 384, 768, 1280] as const

function cloudinaryDeliveryUrl(value: string, width: number) {
  try {
    const url = new URL(value)
    const marker = '/image/upload/'
    if (url.hostname !== 'res.cloudinary.com' || !url.pathname.includes(marker)) return value
    const suffix = url.pathname.slice(url.pathname.indexOf(marker) + marker.length)
    if (suffix.startsWith('s--')) return value
    url.pathname = url.pathname.replace(marker, `${marker}f_webp,fl_lossy,q_auto:eco,w_${width},c_limit/`)
    return url.toString()
  } catch {
    return value
  }
}

function responsiveImage(value: string) {
  const sources = CLOUDINARY_WIDTHS.map((width) => ({ width, url: cloudinaryDeliveryUrl(value, width) }))
  if (sources.every((source) => source.url === value)) return { src: value, srcSet: undefined }
  return {
    src: sources[2].url,
    srcSet: sources.map((source) => `${source.url} ${source.width}w`).join(', '),
  }
}

function galleryImageSizes(layout: ReturnType<typeof getSocialMediaLayout>, index: number) {
  if (layout === 'single') return '(max-width: 800px) calc(100vw - 32px), 728px'
  if (layout === 'featured-stack') return index === 0 ? '(max-width: 800px) 60vw, 435px' : '(max-width: 800px) 40vw, 289px'
  if (layout === 'overflow-grid' && index >= 2) return '(max-width: 800px) 33vw, 240px'
  return '(max-width: 800px) 50vw, 362px'
}

export default function SocialMediaGallery({ media, priority = false }: { media: SocialMediaItem[]; priority?: boolean }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  if (!media.length) return null
  const layout = getSocialMediaLayout(media)
  const visible = media.slice(0, layout === 'overflow-grid' ? 5 : media.length)
  const remaining = media.length - visible.length

  return (
    <>
      <div className={`social-media-gallery social-media-gallery-${layout} mt-5 overflow-hidden rounded-lg border border-[var(--sonic-line)]`}>
        {visible.map((item, index) => {
          const isImage = item.type === 'image'
          const image = isImage ? responsiveImage(item.url) : null
          const isPriority = priority && index === 0
          const content = isImage && image ? <img src={image.src} srcSet={image.srcSet} sizes={galleryImageSizes(layout, index)} alt={item.alt} loading={isPriority ? 'eager' : 'lazy'} fetchPriority={isPriority ? 'high' : undefined} decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:opacity-90" /> : item.type === 'video' ? <div className="relative h-full w-full bg-black"><video src={item.url} poster={item.thumbnailUrl || undefined} preload="metadata" controls className="h-full w-full object-contain" /><span className="sonic-media-badge pointer-events-none absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full p-0"><Play size={14} fill="currentColor" /></span></div> : <iframe src={item.url} title={item.alt} loading="lazy" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          return <div key={item.id} className="group relative min-h-[160px] overflow-hidden bg-[var(--sonic-surface-raised)] sonic-media-surface">{isImage ? <button type="button" className="h-full w-full cursor-zoom-in text-left" onClick={() => setLightboxIndex(index)} aria-label={`Mở hình ảnh ${index + 1}`}>{content}</button> : content}{remaining > 0 && index === visible.length - 1 && <button type="button" onClick={() => setLightboxIndex(index)} className="sonic-media-action absolute inset-0 flex items-center justify-center text-2xl font-bold transition" aria-label={`Mở thư viện, còn ${remaining} hình ảnh`}>+{remaining}</button>}</div>
        })}
      </div>
      <AnimatePresence initial={false}>{lightboxIndex !== null && <SocialLightbox media={media} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}</AnimatePresence>
    </>
  )
}
