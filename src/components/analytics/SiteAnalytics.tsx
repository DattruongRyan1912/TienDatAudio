'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { AnalyticsEventType } from '@/lib/analytics-types'

const SESSION_KEY = 'tda_analytics_session'
const LANDING_KEY = 'tda_landing_context'

function sessionId() {
  const current = window.sessionStorage.getItem(SESSION_KEY)
  if (current) return current
  const next = crypto.randomUUID()
  window.sessionStorage.setItem(SESSION_KEY, next)
  return next
}

export function getAttributionContext() {
  const params = new URLSearchParams(window.location.search)
  const current = {
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: document.referrer.slice(0, 1000),
    sessionId: sessionId(),
    utm: {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      term: params.get('utm_term') || '',
      content: params.get('utm_content') || '',
    },
  }
  const stored = window.sessionStorage.getItem(LANDING_KEY)
  if (stored) {
    try { return JSON.parse(stored) as typeof current } catch { /* replace invalid client storage */ }
  }
  window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(current))
  return current
}

export function trackSiteEvent(type: AnalyticsEventType, detail: { postId?: string; productId?: string } = {}) {
  const context = getAttributionContext()
  const payload = JSON.stringify({ type, sessionId: context.sessionId, path: window.location.pathname, referrer: document.referrer, utm: context.utm, ...detail })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/events', new Blob([payload], { type: 'application/json' }))
  } else {
    void fetch('/api/analytics/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    getAttributionContext()
    trackSiteEvent('page_view')
  }, [pathname])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-analytics-event]')
      if (!target) return
      const type = target.dataset.analyticsEvent as AnalyticsEventType | undefined
      if (type) trackSiteEvent(type, { postId: target.dataset.postId, productId: target.dataset.productId })
    }
    document.addEventListener('click', handleClick, { passive: true })
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
