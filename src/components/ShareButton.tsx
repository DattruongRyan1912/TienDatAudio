'use client'

import { Share2, Facebook, MessageCircle, Copy, Mail, X } from 'lucide-react'
import { useNotification } from '@/hooks/useNotification'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  excerpt: string
}

export default function ShareButton({ title, excerpt }: ShareButtonProps) {
  const { showSuccess } = useNotification()
  const [showModal, setShowModal] = useState(false)
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(excerpt)

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Zalo',
      icon: <MessageCircle className="w-5 h-5" />,
      url: `https://zalo.me/share?url=${encodedUrl}&title=${encodedTitle}`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ]

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt,
          url: currentUrl,
        })
        setShowModal(false)
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      showSuccess('Đã sao chép!', 'Link đã được sao chép vào clipboard.')
      setShowModal(false)
    } catch (error) {
      showSuccess('Đã sao chép!', 'Link đã được sao chép.')
      setShowModal(false)
    }
  }

  const handleShareClick = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => setShowModal(true)}
      >
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Chia sẻ</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-4 space-y-3">
              {/* Social Media Options */}
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleShareClick(option.url)}
                  className={`w-full flex items-center gap-3 p-3 text-white rounded-lg transition-colors ${option.color}`}
                >
                  {option.icon}
                  <span className="font-medium">Chia sẻ lên {option.name}</span>
                </button>
              ))}

              {/* Native Share (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Chia sẻ khác</span>
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
              >
                <Copy className="w-5 h-5" />
                <span className="font-medium">Sao chép liên kết</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
