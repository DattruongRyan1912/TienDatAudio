import { ExternalLink } from 'lucide-react'
import type { SocialLinkPreview as SocialLinkPreviewData } from '@/modules/social/domain/types'

export default function SocialLinkPreview({ link }: { link: SocialLinkPreviewData }) {
  const isFacebookSource = /(^|\.)facebook\.com$/i.test(link.domain) || link.domain.toLowerCase() === 'fb.watch'
  const isGenericFacebookTitle = /^(facebook|bài viết facebook công khai)$/i.test(link.title.trim())
  const eyebrow = isFacebookSource ? 'Nguồn bài viết' : link.domain
  const title = isFacebookSource && isGenericFacebookTitle ? 'Xem bài viết gốc' : link.title
  return <a href={link.url} target="_blank" rel="noreferrer" className="mt-4 flex min-w-0 items-center gap-3 border-y border-[var(--sonic-line)] py-3 transition-colors hover:border-[var(--sonic-gold)]" aria-label={`Mở ${isFacebookSource ? 'bài viết gốc' : `liên kết ${link.title}`}`}>
    <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--sonic-subtle)]">{eyebrow}</span>
    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--sonic-text)]">{title}</span>
    <ExternalLink size={14} className="shrink-0 text-[var(--sonic-gold)]" aria-hidden="true" />
  </a>
}
