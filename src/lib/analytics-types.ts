export const ANALYTICS_EVENT_TYPES = [
  'page_view', 'article_view', 'article_cta', 'product_view', 'product_cta', 'phone_click', 'zalo_click', 'map_click', 'contact_submit',
] as const

export type AnalyticsEventType = typeof ANALYTICS_EVENT_TYPES[number]

export interface AnalyticsEventInput {
  type: AnalyticsEventType
  sessionId: string
  path: string
  referrer: string
  postId?: string
  productId?: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
}
