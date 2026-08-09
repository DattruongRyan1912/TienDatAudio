/* eslint-disable @next/next/no-img-element */
import { ExternalLink } from 'lucide-react'
import type { SocialLinkPreview as SocialLinkPreviewData } from '@/modules/social/domain/types'

export default function SocialLinkPreview({ link }: { link: SocialLinkPreviewData }) {
  return <a href={link.url} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] transition-colors hover:border-[var(--sonic-gold)]">{link.imageUrl && <img src={link.imageUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />}<div className="p-4"><p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--sonic-subtle)]">{link.domain}</p><p className="mt-2 font-bold text-[var(--sonic-text)]">{link.title}</p>{link.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--sonic-muted)]">{link.description}</p>}<span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--sonic-gold)]">Mở liên kết <ExternalLink size={13} /></span></div></a>
}
