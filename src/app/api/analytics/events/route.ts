import { NextResponse } from 'next/server'
import { createAnalyticsEvent } from '@/lib/analytics-repository'
import { ANALYTICS_EVENT_TYPES, type AnalyticsEventInput, type AnalyticsEventType } from '@/lib/analytics-types'

export const runtime = 'nodejs'

function text(value: unknown, max = 500) {
  return String(value || '').trim().slice(0, max)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return NextResponse.json({ accepted: false }, { status: 403 })
  }
  try {
    const body = await request.json() as Record<string, unknown>
    const type = text(body.type, 40) as AnalyticsEventType
    const sessionId = text(body.sessionId, 100)
    const path = text(body.path, 500)
    if (!ANALYTICS_EVENT_TYPES.includes(type) || !sessionId || !path.startsWith('/')) {
      return NextResponse.json({ accepted: false }, { status: 400 })
    }
    const utmInput = body.utm && typeof body.utm === 'object' ? body.utm as Record<string, unknown> : {}
    const event: AnalyticsEventInput = {
      type,
      sessionId,
      path,
      referrer: text(body.referrer, 1000),
      postId: text(body.postId, 100) || undefined,
      productId: text(body.productId, 100) || undefined,
      utm: {
        source: text(utmInput.source, 120) || undefined,
        medium: text(utmInput.medium, 120) || undefined,
        campaign: text(utmInput.campaign, 160) || undefined,
        term: text(utmInput.term, 160) || undefined,
        content: text(utmInput.content, 160) || undefined,
      },
    }
    const stored = await createAnalyticsEvent(event)
    return NextResponse.json({ accepted: true, stored }, { status: 202 })
  } catch (error) {
    console.error('[analytics/events]', error)
    return NextResponse.json({ accepted: false }, { status: 202 })
  }
}
