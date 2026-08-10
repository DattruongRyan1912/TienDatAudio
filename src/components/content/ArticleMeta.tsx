import { calculateReadingTime } from '@/lib/content-validation'

function formatEditorialDate(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Chưa xuất bản'

  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date).replace(/\btháng\b/, 'Tháng')
}

function EditorialVerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-[#0040e0]"
      role="img"
      aria-label="Tác giả đã xác minh"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.81L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
      />
      <path fill="#fff" d="m10.6 16.6-4.2-4.2 1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4-7 7z" />
    </svg>
  )
}

export default function ArticleMeta({ author, publishedAt, readingTime, bodyMarkdown }: { author: string; publishedAt: string; readingTime: number; bodyMarkdown: string }) {
  const resolvedReadingTime = readingTime > 0 ? readingTime : calculateReadingTime(bodyMarkdown)

  return (
    <div data-component="article-meta" className="mt-6">
      <div className="flex min-w-0 items-center gap-1 text-[18px] font-normal leading-7 text-[var(--sonic-text)]">
        <span className="truncate">{author}</span>
        <EditorialVerifiedBadge />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-5 text-[var(--sonic-muted)]">
        <time dateTime={publishedAt}>{formatEditorialDate(publishedAt)}</time>
        <span aria-hidden="true">•</span>
        <span>{resolvedReadingTime} phút đọc</span>
      </div>
    </div>
  )
}
