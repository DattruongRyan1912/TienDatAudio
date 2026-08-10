/* eslint-disable @next/next/no-img-element */
import { Globe2, MoreHorizontal } from 'lucide-react'
import type { SocialAuthor } from '@/modules/social/domain/types'

function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-[#0040e0]"
      role="img"
      aria-label="Đã xác minh"
      focusable="false"
    >
      <title>Đã xác minh</title>
      <path
        fill="currentColor"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.81L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
      />
      <path fill="#fff" d="m10.6 16.6-4.2-4.2 1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4-7 7z" />
    </svg>
  )
}

export default function SocialPostHeader({ author, publishedAt, source }: { author: SocialAuthor; publishedAt: string | null; source?: string }) {
  const date = publishedAt ? new Date(publishedAt) : null
  const displayDate = date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date) : 'Chưa xuất bản'
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--sonic-line)] bg-[var(--sonic-surface-raised)] text-xs font-bold text-[var(--sonic-gold)]">
          {author.avatarUrl ? <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" /> : author.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-[var(--sonic-text)]">{author.displayName}</p>
            {author.verified && <VerifiedBadge />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-[var(--sonic-subtle)]">
            <time dateTime={date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined}>{displayDate}</time>
            <span aria-hidden="true">·</span>
            {source ? <span>{source}</span> : <><Globe2 size={12} aria-hidden="true" /><span>Công khai</span></>}
          </div>
        </div>
      </div>
      <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--sonic-subtle)] hover:bg-[var(--sonic-surface-raised)] hover:text-[var(--sonic-text)]" aria-label="Tùy chọn bài viết">
        <MoreHorizontal size={18} />
      </button>
    </header>
  )
}
