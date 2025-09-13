'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  excerpt: string
}

export default function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã copy link bài viết!')
    }
  }

  return (
    <button
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Chia sẻ
    </button>
  )
}
