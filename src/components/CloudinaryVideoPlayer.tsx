'use client'

import { useState } from 'react'

interface CloudinaryVideoPlayerProps {
  publicId: string
  cloudName?: string
  width?: number
  height?: number
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  poster?: string
  className?: string
  quality?: 'auto:low' | 'auto:good' | 'auto:best' | 'auto:eco'
  responsive?: boolean
}

export default function CloudinaryVideoPlayer({
  publicId,
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  width = 1080,
  height = 1920,
  autoplay = false,
  muted = true,
  controls = true,
  loop = true,
  poster,
  className = '',
  quality = 'auto:good',
  responsive = true
}: CloudinaryVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate optimized video URL using Cloudinary URL API
  const generateVideoUrl = (targetWidth?: number, targetHeight?: number, targetQuality?: string) => {
    const w = targetWidth || width
    const h = targetHeight || height
    const q = targetQuality || quality
    
    // Basic Cloudinary video URL with transformations and WebP support
    return `https://res.cloudinary.com/${cloudName}/video/upload/w_${w},h_${h},c_fill,g_center,q_${q},f_auto/${publicId}.mp4`
  }

  // Generate responsive video sources
  const generateResponsiveSources = () => {
    return [
      {
        src: generateVideoUrl(1080, 1920, 'auto:good'),
        type: 'video/mp4',
        media: '(min-width: 768px)'
      },
      {
        src: generateVideoUrl(720, 1280, 'auto:low'),
        type: 'video/mp4',
        media: '(min-width: 480px)'
      },
      {
        src: generateVideoUrl(480, 854, 'auto:eco'),
        type: 'video/mp4',
        media: '(max-width: 479px)'
      }
    ]
  }

  // Generate poster image URL
  const generatePosterUrl = () => {
    if (poster) return poster
    
    // Generate poster from video frame at 1 second with WebP format
    return `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},h_${height},c_fill,g_center,q_auto,f_webp,so_1/${publicId}.jpg`
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleLoadedData = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">Không thể tải video</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <video
        className="w-full h-full object-cover rounded-lg"
        autoPlay={autoplay}
        muted={muted}
        controls={controls}
        loop={loop}
        playsInline
        poster={generatePosterUrl()}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        preload="metadata"
      >
        {responsive ? (
          generateResponsiveSources().map((source, index) => (
            <source
              key={index}
              src={source.src}
              type={source.type}
              media={source.media}
            />
          ))
        ) : (
          <source src={generateVideoUrl()} type="video/mp4" />
        )}
        
        <p className="text-sm text-gray-600 p-4">
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </p>
      </video>
    </div>
  )
}

// Hook for generating Cloudinary URLs
export function useCloudinaryUrl(publicId: string, type: 'image' | 'video' = 'image') {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const generateUrl = (options: {
    width?: number
    height?: number
    quality?: string
    format?: string
    crop?: string
    gravity?: string
  } = {}) => {
    const {
      width = 800,
      height = 600,
      quality = 'auto',
      format: fmt = 'webp', // Default to WebP for images
      crop = 'fill',
      gravity = 'center'
    } = options

    const baseUrl = `https://res.cloudinary.com/${cloudName}/${type}/upload`
    const transformations = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_${fmt}`
    
    return `${baseUrl}/${transformations}/${publicId}`
  }

  const generateResponsiveUrls = () => {
    return {
      mobile: generateUrl({ width: 480, height: 600, quality: 'auto:eco', format: 'webp' }),
      tablet: generateUrl({ width: 768, height: 960, quality: 'auto:good', format: 'webp' }),
      desktop: generateUrl({ width: 1080, height: 1350, quality: 'auto:good', format: 'webp' })
    }
  }

  return {
    generateUrl,
    generateResponsiveUrls
  }
}
