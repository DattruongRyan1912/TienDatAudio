'use client'

import { Check, Copy, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SocialPostActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && Boolean(navigator.share))
  }, [])

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'Tiến Đạt Audio', url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // User cancellation is intentionally silent.
    }
  }

  return <div className="mt-4 flex items-center justify-end border-t border-[var(--sonic-line)] pt-3"><button type="button" onClick={() => void share()} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-gold)]" data-analytics-event="social_share">{copied ? <Check size={15} /> : canShare ? <Share2 size={15} /> : <Copy size={15} />}{copied ? 'Đã sao chép' : canShare ? 'Chia sẻ' : 'Sao chép liên kết'}</button></div>
}
