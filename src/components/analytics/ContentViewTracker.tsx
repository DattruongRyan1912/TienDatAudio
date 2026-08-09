'use client'

import { useEffect } from 'react'
import { trackSiteEvent } from './SiteAnalytics'

export default function ContentViewTracker({ type, id }: { type: 'article' | 'product'; id: string }) {
  useEffect(() => {
    const key = `tda_view_${type}_${id}`
    if (window.sessionStorage.getItem(key)) return
    window.sessionStorage.setItem(key, '1')
    trackSiteEvent(type === 'article' ? 'article_view' : 'product_view', type === 'article' ? { postId: id } : { productId: id })
  }, [id, type])
  return null
}
