'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface SocialMedia {
  facebook: string
  youtube: string
  instagram: string
  tiktok: string
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  contactPhone: string
  address: string
  businessHours: string
  logo: string
  favicon: string
  socialMedia: SocialMedia
  smtp: {
    host: string
    port: number
    username: string
    password: string
    secure: boolean
  }
  analytics: {
    googleAnalyticsId: string
    facebookPixelId: string
    googleTagManagerId: string
  }
  updatedAt: string
}

interface SettingsContextType {
  settings: SiteSettings | null
  reloadSettings: () => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const pathname = usePathname()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSettings(result.data)
          
          // Apply settings to document
          applySettingsToDocument(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applySettingsToDocument = (settingsData: SiteSettings) => {
    if (typeof document === 'undefined') return

    // Update document title
    if (settingsData.siteName) {
      document.title = settingsData.siteName
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription && settingsData.siteDescription) {
      metaDescription.setAttribute('content', settingsData.siteDescription)
    }

    // Update favicon if specified
    if (settingsData.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      favicon.setAttribute('href', settingsData.favicon)
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon)
      }
    }

    // Add analytics scripts if configured
    if (settingsData.analytics?.googleAnalyticsId) {
      addGoogleAnalytics(settingsData.analytics.googleAnalyticsId)
    }
  }

  const addGoogleAnalytics = (gaId: string) => {
    // Check if already added
    if (document.querySelector(`script[src*="${gaId}"]`)) return

    // Add gtag script
    const gtagScript = document.createElement('script')
    gtagScript.async = true
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(gtagScript)

    // Add gtag config
    const configScript = document.createElement('script')
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `
    document.head.appendChild(configScript)
  }

  const reloadSettings = async () => {
    await loadSettings()
  }

  useEffect(() => {
    if (pathname?.startsWith('/admin') && pathname !== '/admin/login') loadSettings()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}
