'use client'

import dynamic from 'next/dynamic'
import { Bot, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const AssistantWidget = dynamic(() => import('./AssistantWidget'), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-5 left-4 z-40 md:bottom-8 md:left-7">
      <button type="button" disabled className="flex h-12 items-center gap-2 border border-[var(--sonic-gold)] bg-[var(--sonic-surface)] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] opacity-70">
        <LoaderCircle size={17} className="animate-spin text-[var(--sonic-gold)]" />
        <span className="hidden sm:inline">Đang mở</span>
      </button>
    </div>
  ),
})

export default function AssistantWidgetGate() {
  const [enabled, setEnabled] = useState(false)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    let active = true
    void fetch('/api/assistant/session', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return false
        const payload = await response.json() as { data?: { enabled?: boolean } }
        return payload.data?.enabled === true
      })
      .then((available) => { if (active) setEnabled(available) })
      .catch(() => { if (active) setEnabled(false) })
    return () => { active = false }
  }, [])

  if (!enabled) return null
  if (activated) return <AssistantWidget initialOpen />

  return (
    <div className="fixed bottom-5 left-4 z-40 md:bottom-8 md:left-7">
      <button
        type="button"
        onClick={() => setActivated(true)}
        aria-label="Mở trợ lý tư vấn"
        className="flex h-12 items-center gap-2 border border-[var(--sonic-gold)] bg-[var(--sonic-surface)] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] shadow-[0_0_20px_var(--sonic-gold-soft)] transition-transform hover:-translate-y-1"
      >
        <Bot size={17} className="text-[var(--sonic-gold)]" />
        <span className="hidden sm:inline">Hỏi trợ lý</span>
      </button>
    </div>
  )
}
