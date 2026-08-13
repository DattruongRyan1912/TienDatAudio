'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ResolvedThemeMode = 'dark' | 'light'

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textLight: string
  border: string
  success: string
  warning: string
  error: string
}

interface ThemeData {
  id: string
  colors: ThemeColors
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, string>
  }
  layout: {
    maxWidth: string
    headerHeight: string
    footerHeight: string
    sidebarWidth: string
    spacing: Record<string, string>
    borderRadius: Record<string, string>
  }
}

const defaultTheme: ThemeData = {
  id: 'sonic-purity',
  colors: {
    primary: '#d4af37',
    secondary: '#9ea2a2',
    accent: '#d4af37',
    background: '#080808',
    surface: '#111111',
    text: '#e5e2e1',
    textLight: '#9ea2a2',
    border: 'rgba(229, 226, 225, 0.14)',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
  },
  typography: {
    fontFamily: 'Manrope, Arial, sans-serif',
    fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
    fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  },
  layout: {
    maxWidth: '1440px',
    headerHeight: '80px',
    footerHeight: '200px',
    sidebarWidth: '280px',
    spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
    borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
  },
}

interface ThemeContextType {
  theme: ThemeData | null
  updateTheme: (newTheme: Partial<ThemeData>) => Promise<void>
  reloadTheme: () => Promise<void>
  isLoading: boolean
  mode: ThemeMode
  resolvedMode: ResolvedThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const THEME_STORAGE_KEY = 'sonic_theme_mode'
const THEME_COOKIE_KEY = 'sonic_theme'

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'dark' || value === 'light' || value === 'system'
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyMode(mode: ResolvedThemeMode) {
  const root = document.documentElement
  root.dataset.theme = mode
  // Keep the legacy Tailwind dark selector in sync during migration.
  root.classList.toggle('dark', mode === 'dark')
  root.classList.toggle('light', mode === 'light')
  root.style.colorScheme = mode
}

function persistMode(mode: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  document.cookie = `${THEME_COOKIE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  initialMode?: ThemeMode
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const pathname = usePathname()
  const [mode, setModeState] = useState<ThemeMode>(initialMode)
  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(initialMode === 'light' ? 'light' : 'dark')
  const [modeReady, setModeReady] = useState(false)
  const [theme, setTheme] = useState<ThemeData | null>(defaultTheme)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    const nextMode = isThemeMode(stored) ? stored : initialMode
    const nextResolved = nextMode === 'system' ? getSystemMode() : nextMode
    setModeState(nextMode)
    setResolvedMode(nextResolved)
    persistMode(nextMode)
    applyMode(nextResolved)
    setModeReady(true)
  }, [initialMode])

  useEffect(() => {
    if (!modeReady) return
    const nextResolved = mode === 'system' ? getSystemMode() : mode
    setResolvedMode(nextResolved)
    applyMode(nextResolved)
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handleSystemChange = () => {
      const systemMode = getSystemMode()
      setResolvedMode(systemMode)
      applyMode(systemMode)
    }
    media.addEventListener?.('change', handleSystemChange)
    return () => media.removeEventListener?.('change', handleSystemChange)
  }, [mode, modeReady])

  function setMode(nextMode: ThemeMode) {
    setModeState(nextMode)
    persistMode(nextMode)
  }

  function toggleMode() {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }

  async function loadTheme() {
    if (!pathname?.startsWith('/admin') || pathname === '/admin/login') return
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/theme', { cache: 'no-store' })
      if (!response.ok) return
      const payload = await response.json() as { data?: ThemeData }
      if (payload.data?.colors) setTheme(payload.data)
    } catch {
      // The mode/token system remains usable when the legacy endpoint is unavailable.
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTheme(newTheme: Partial<ThemeData>) {
    if (!theme) return
    const updatedTheme: ThemeData = {
      ...theme,
      ...newTheme,
      colors: { ...theme.colors, ...(newTheme.colors || {}) },
      typography: { ...theme.typography, ...(newTheme.typography || {}) },
      layout: { ...theme.layout, ...(newTheme.layout || {}) },
    }
    const response = await fetch('/api/admin/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: updatedTheme }),
    })
    if (!response.ok) throw new Error('Không thể lưu cấu hình theme')
    const payload = await response.json() as { data?: ThemeData }
    setTheme(payload.data || updatedTheme)
  }

  const contextValue: ThemeContextType = {
    theme,
    updateTheme,
    reloadTheme: loadTheme,
    isLoading,
    mode,
    resolvedMode,
    setMode,
    toggleMode,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
