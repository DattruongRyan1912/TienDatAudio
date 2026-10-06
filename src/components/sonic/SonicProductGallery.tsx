'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { SONIC_MOTION, SONIC_REVEAL_EASE } from './sonic-motion'

export default function SonicProductGallery({ images, name }: { images: string[]; name: string }) {
  const sources = images.length ? images : ['/uploads/1757873177981_wez3lmbcclj.jpg']
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()

  return (
    <div>
      {/* Main Image View */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm p-4 md:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sources[active]}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : SONIC_MOTION.interaction, ease: SONIC_REVEAL_EASE }}
            className="absolute inset-4 md:inset-8"
          >
            <Image
              src={sources[active]}
              alt={name}
              fill
              priority fetchPriority="high"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
        <span className="absolute left-4 top-4 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          Hình {active + 1} / {sources.length}
        </span>
      </div>

      {/* Thumbnails */}
      {sources.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {sources.map((source, index) => (
            <button
              key={source}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-white p-1.5 transition-all ${
                active === index
                  ? 'border-[#d32f2f] ring-2 ring-red-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-current={active === index ? 'true' : undefined}
            >
              <Image src={source} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
