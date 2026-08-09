'use client'

import { useState } from 'react'

export default function SocialPostContent({ title, text }: { title: string; text: string }) {
  const [expanded, setExpanded] = useState(false)
  const longText = text.length > 520 || text.split('\n').length > 8
  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold leading-tight tracking-[-0.025em] text-[var(--sonic-text)]">{title}</h2>
      <div className={`social-post-copy mt-3 whitespace-pre-wrap text-[0.95rem] leading-7 text-[var(--sonic-muted)] ${longText ? `social-post-copy-expandable ${expanded ? 'social-post-copy-expanded' : 'social-post-copy-collapsed'}` : ''}`}>
        {text || 'Bài viết đang được cập nhật.'}
      </div>
      {longText && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 text-xs font-bold text-[var(--sonic-gold)] hover:text-[var(--sonic-gold-hover)]">{expanded ? 'Thu gọn' : 'Xem thêm'}</button>}
    </div>
  )
}
