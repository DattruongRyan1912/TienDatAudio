'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme()
  const nextLabel = resolvedMode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--sonic-muted)] transition-colors hover:bg-[var(--sonic-surface-raised)] hover:text-[var(--sonic-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sonic-gold)]"
      aria-label={nextLabel}
      title={nextLabel}
    >
      {resolvedMode === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  )
}
