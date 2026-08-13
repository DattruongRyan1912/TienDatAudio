'use client'

import { useEffect, useRef, useState } from 'react'

interface SonicDeferredMapProps {
  embedUrl: string
  name: string
}

export default function SonicDeferredMap({ embedUrl, name }: SonicDeferredMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || shouldLoad || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin: '200px 0px' })

    observer.observe(container)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div ref={containerRef} className="sonic-map-frame relative mt-3 h-44 overflow-hidden border border-[var(--sonic-line)] bg-[var(--sonic-surface)] sm:h-48 md:h-40 lg:h-44">
      {shouldLoad ? (
        <iframe
          src={embedUrl}
          width="600"
          height="450"
          className="h-full w-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title={`Bản đồ ${name}`}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
          <span className="sonic-label text-[var(--sonic-subtle)]">Google Maps</span>
          <button
            type="button"
            onClick={() => setShouldLoad(true)}
            className="border border-[var(--sonic-line)] px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--sonic-text)] transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-gold)]"
          >
            Tải bản đồ
          </button>
        </div>
      )}
    </div>
  )
}
