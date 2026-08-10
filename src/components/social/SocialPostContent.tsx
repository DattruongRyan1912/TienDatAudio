'use client'

import { useState } from 'react'
import { getDisplaySocialText, getSocialDiscoveryTitle } from '@/modules/social/domain/source-content'

export default function SocialPostContent({ title, text, sourceUrl, category, headingLevel = 2 }: { title: string; text: string; sourceUrl?: string; category?: string; headingLevel?: 1 | 2 }) {
  const [expanded, setExpanded] = useState(false)
  const displayText = getDisplaySocialText(text)
  const displayTitle = getSocialDiscoveryTitle({ title, text: displayText, category })
  const longText = displayText.length > 520 || displayText.split('\n').length > 8
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <div className="mt-4">
      <Heading className={`${headingLevel === 1 ? 'text-2xl md:text-3xl' : 'text-lg'} font-bold leading-tight tracking-[-0.025em] text-[var(--sonic-text)]`}>{displayTitle}</Heading>
      <div className={`social-post-copy mt-3 whitespace-pre-wrap text-[0.95rem] leading-7 text-[var(--sonic-muted)] ${longText ? `social-post-copy-expandable ${expanded ? 'social-post-copy-expanded' : 'social-post-copy-collapsed'}` : ''}`}>
        {displayText || (sourceUrl ? 'Nội dung bài viết đang được cập nhật.' : 'Bài viết đang được cập nhật.')}
      </div>
      {longText && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 text-xs font-bold text-[var(--sonic-gold)] hover:text-[var(--sonic-gold-hover)]">{expanded ? 'Thu gọn' : 'Xem thêm'}</button>}
    </div>
  )
}
