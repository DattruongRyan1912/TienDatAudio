'use client'

import { useEffect } from 'react'

const SANITIZED_ID_PREFIX = 'user-content-'
const TOC_LINK_SELECTOR = '.article-toc a[href^="#user-content-"]'

interface TocEntry {
  anchor: HTMLAnchorElement
  target: HTMLElement
}

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

function getTocEntries(): TocEntry[] {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR)).flatMap((anchor) => {
    const targetId = anchor.getAttribute('href')?.slice(1)
    const target = targetId ? document.getElementById(targetId) : null
    return target ? [{ anchor, target }] : []
  })
}

function updateActiveToc(entries: TocEntry[]) {
  if (entries.length === 0) return

  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0
  const activationLine = headerBottom + 56
  let activeIndex = -1

  entries.forEach((entry, index) => {
    if (entry.target.getBoundingClientRect().top <= activationLine) activeIndex = index
  })

  entries.forEach((entry, index) => {
    const isActive = index === activeIndex
    entry.anchor.classList.toggle('article-toc-link-active', isActive)
    if (isActive) entry.anchor.setAttribute('aria-current', 'location')
    else entry.anchor.removeAttribute('aria-current')
  })
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
    const tocEntries = getTocEntries()
    let activeFrame = 0
    const scheduleActiveTocUpdate = () => {
      if (activeFrame) return
      activeFrame = window.requestAnimationFrame(() => {
        activeFrame = 0
        updateActiveToc(tocEntries)
      })
    }
    const handleHashChange = () => scrollToHashTarget()
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return

      const anchor = event.target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.closest('.article-page')) return
      if (anchor.href !== window.location.href || !window.location.hash) return

      window.setTimeout(handleHashChange, 0)
    }

    scrollToHashTarget()
    scheduleActiveTocUpdate()
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('scroll', scheduleActiveTocUpdate, { passive: true })
    window.addEventListener('resize', scheduleActiveTocUpdate)
    document.addEventListener('click', handleClick)

    return () => {
      if (activeFrame) window.cancelAnimationFrame(activeFrame)
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('scroll', scheduleActiveTocUpdate)
      window.removeEventListener('resize', scheduleActiveTocUpdate)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
