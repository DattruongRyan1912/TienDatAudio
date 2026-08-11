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

function alignHashTarget(target: HTMLElement, behavior: ScrollBehavior) {
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0
  const scrollMarginTop = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
  const offset = Math.max(headerBottom, scrollMarginTop)
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset)
  window.scrollTo({ top, behavior })
}

function scrollToHashTarget() {
  const target = getHashTarget()
  if (!target) return

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.requestAnimationFrame(() => {
    alignHashTarget(target, behavior)
    window.setTimeout(() => alignHashTarget(target, 'auto'), 400)
  })
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
