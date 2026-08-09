'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

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
  id: 'default',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  layout: {
    maxWidth: '1200px',
    headerHeight: '80px',
    footerHeight: '200px',
    sidebarWidth: '280px',
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem'
    }
  }
}

interface ThemeContextType {
  theme: ThemeData | null
  updateTheme: (newTheme: Partial<ThemeData>) => void
  reloadTheme: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<ThemeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadTheme = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/theme')
      if (response.ok) {
        const result = await response.json()
        const themeData = result.data || result // Handle both {data: theme} and direct theme response
        
        // Validate theme data structure
        if (themeData && themeData.colors) {
          setTheme(themeData)
          applyThemeToDocument(themeData)
        } else {
          console.warn('Invalid theme data received:', themeData)
          // Use default theme if data is invalid
          setTheme(defaultTheme)
          applyThemeToDocument(defaultTheme)
        }
      } else {
        console.warn('Failed to load theme, using default')
        setTheme(defaultTheme)
        applyThemeToDocument(defaultTheme)
      }
    } catch (error) {
      console.error('Error loading theme:', error)
      // Use default theme on error
      setTheme(defaultTheme)
      applyThemeToDocument(defaultTheme)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTheme = async (newTheme: Partial<ThemeData>) => {
    if (!theme) return

    try {
      const updatedTheme = { ...theme, ...newTheme }
      
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: updatedTheme }),
      })

      if (response.ok) {
        await response.json()
        setTheme(updatedTheme)
        applyThemeToDocument(updatedTheme)
      } else {
        const error = await response.json()
        console.error('Failed to update theme:', error)
      }
    } catch (error) {
      console.error('Error updating theme:', error)
    }
  }

  const applyThemeToDocument = (themeData: ThemeData) => {
    if (!themeData || !themeData.colors) {
      console.warn('Theme data is incomplete, skipping CSS application')
      return
    }

    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeData.colors.primary)
    root.style.setProperty('--color-secondary', themeData.colors.secondary)
    root.style.setProperty('--color-accent', themeData.colors.accent)
    root.style.setProperty('--color-background', themeData.colors.background)
    root.style.setProperty('--color-surface', themeData.colors.surface)
    root.style.setProperty('--color-text', themeData.colors.text)
    root.style.setProperty('--color-text-light', themeData.colors.textLight)
    root.style.setProperty('--color-border', themeData.colors.border)
    root.style.setProperty('--color-success', themeData.colors.success)
    root.style.setProperty('--color-warning', themeData.colors.warning)
    root.style.setProperty('--color-error', themeData.colors.error)
    
    // Apply typography
    root.style.setProperty('--font-family', themeData.typography.fontFamily)
    
    // Apply layout
    root.style.setProperty('--max-width', themeData.layout.maxWidth)
    root.style.setProperty('--header-height', themeData.layout.headerHeight)
    
    // Force re-render of styled components
    root.classList.toggle('theme-updated')
  }

  useEffect(() => {
    if (pathname?.startsWith('/admin') && pathname !== '/admin/login') loadTheme()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: ThemeContextType = {
    theme,
    updateTheme,
    reloadTheme: loadTheme,
    isLoading,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
