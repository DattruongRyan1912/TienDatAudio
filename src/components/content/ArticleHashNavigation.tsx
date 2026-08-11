'use client'

import { useEffect } from 'react'

const SANITIZED_ID_PREFIX = 'user-content-'

function getHashTarget() {
  const rawHash = window.location.hash.slice(1)
  if (!rawHash) return null

  let hash = rawHash
  try {
    hash = decodeURIComponent(rawHash)
  } catch {
    return null
  }

  return document.getElementById(`${SANITIZED_ID_PREFIX}${hash}`) || document.getElementById(hash)
}

function scrollToHashTarget() {
  const target = getHashTarget()
  if (!target) return

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.requestAnimationFrame(() => target.scrollIntoView({ behavior, block: 'start' }))
}

export default function ArticleHashNavigation() {
  useEffect(() => {
    const handleHashChange = () => scrollToHashTarget()
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return

      const anchor = event.target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.closest('.article-page')) return
      if (anchor.href !== window.location.href || !window.location.hash) return

      window.setTimeout(handleHashChange, 0)
    }

    scrollToHashTarget()
    window.addEventListener('hashchange', handleHashChange)
    document.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
