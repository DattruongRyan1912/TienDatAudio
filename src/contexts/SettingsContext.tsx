'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage: string
  }
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

    // Add Open Graph meta tags
    updateMetaTag('property', 'og:title', settingsData.seo?.metaTitle || settingsData.siteName)
    updateMetaTag('property', 'og:description', settingsData.seo?.metaDescription || settingsData.siteDescription)
    updateMetaTag('property', 'og:url', settingsData.siteUrl)
    if (settingsData.seo?.ogImage) {
      updateMetaTag('property', 'og:image', settingsData.seo.ogImage)
    }

    // Add Twitter Card meta tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', settingsData.seo?.metaTitle || settingsData.siteName)
    updateMetaTag('name', 'twitter:description', settingsData.seo?.metaDescription || settingsData.siteDescription)
    
    // Add keywords
    if (settingsData.seo?.keywords?.length) {
      updateMetaTag('name', 'keywords', settingsData.seo.keywords.join(', '))
    }

    // Add analytics scripts if configured
    if (settingsData.analytics?.googleAnalyticsId) {
      addGoogleAnalytics(settingsData.analytics.googleAnalyticsId)
    }
  }

  const updateMetaTag = (attribute: string, value: string, content: string) => {
    let meta = document.querySelector(`meta[${attribute}="${value}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, value)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
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
    loadSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}
