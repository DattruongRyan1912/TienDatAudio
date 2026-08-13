'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { SONIC_MOTION, SONIC_REVEAL_EASE } from './sonic-motion'

export default function SonicProductGallery({ images, name }: { images: string[]; name: string }) {
  const sources = images.length ? images : ['/images/sonic-hero.png']
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  return (
    <div>
      <div className="sonic-media-surface relative aspect-square overflow-hidden border border-white/10 bg-[#111111]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={sources[active]} initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }} transition={{ duration: reduceMotion ? 0 : SONIC_MOTION.interaction, ease: SONIC_REVEAL_EASE }} className="absolute inset-0">
            <Image src={sources[active]} alt={name} fill priority fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-8 md:p-16" />
          </motion.div>
        </AnimatePresence>
        <span className="sonic-media-badge sonic-label absolute left-5 top-5 px-2 py-1">Product view / 0{active + 1}</span>
      </div>
      {sources.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{sources.map((source, index) => <button key={source} type="button" onClick={() => setActive(index)} className={`sonic-gallery-thumb relative aspect-square overflow-hidden border bg-[#111111] ${active === index ? 'border-[#d4af37]' : 'border-white/10'}`} aria-label={`Xem ảnh ${index + 1}`} aria-current={active === index ? 'true' : undefined}><Image src={source} alt="" fill sizes="100px" className="object-contain p-2" /></button>)}</div>}
    </div>
  )
}
