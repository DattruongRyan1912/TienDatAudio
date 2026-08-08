'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function SonicProductGallery({ images, name }: { images: string[]; name: string }) {
  const sources = images.length ? images : ['/images/sonic-hero.png']
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="relative aspect-square overflow-hidden border border-white/10 bg-[#111111]">
        <Image src={sources[active]} alt={name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-8 md:p-16" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/35 to-transparent" />
        <span className="sonic-label absolute left-5 top-5 text-[#858989]">Product view / 0{active + 1}</span>
      </div>
      {sources.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{sources.map((source, index) => <button key={source} type="button" onClick={() => setActive(index)} className={`relative aspect-square overflow-hidden border bg-[#111111] ${active === index ? 'border-[#d4af37]' : 'border-white/10'}`} aria-label={`Xem ảnh ${index + 1}`}><Image src={source} alt="" fill sizes="100px" className="object-contain p-2" /></button>)}</div>}
    </div>
  )
}

