'use client'

import { useSettings } from '@/contexts/SettingsContext'

interface SiteNameProps {
  className?: string
  fallback?: string
}

export default function SiteName({ className = '', fallback = 'Tiến Đạt Audio' }: SiteNameProps) {
  const { settings, isLoading } = useSettings()

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  return (
    <span className={className}>
      {settings?.siteName || fallback}
    </span>
  )
}
