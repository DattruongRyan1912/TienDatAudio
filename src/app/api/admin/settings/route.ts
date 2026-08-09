import { NextResponse } from 'next/server'
import fallbackSettings from '../../../../../data/settings.json'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getDb, hasMongoConfig } from '@/lib/mongodb'

export const runtime = 'nodejs'

type SiteRuntimeSettings = {
  favicon: string
  analytics: {
    googleAnalyticsId: string
    facebookPixelId: string
    googleTagManagerId: string
  }
  updatedAt: string
}

function text(value: unknown, max = 200) {
  return String(value || '').trim().slice(0, max)
}

function normalize(value: unknown): SiteRuntimeSettings {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const analytics = input.analytics && typeof input.analytics === 'object' ? input.analytics as Record<string, unknown> : {}
  return {
    favicon: text(input.favicon || fallbackSettings.favicon, 500),
    analytics: {
      googleAnalyticsId: text(analytics.googleAnalyticsId),
      facebookPixelId: text(analytics.facebookPixelId),
      googleTagManagerId: text(analytics.googleTagManagerId),
    },
    updatedAt: text(input.updatedAt || fallbackSettings.updatedAt, 40),
  }
}

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  if (!hasMongoConfig()) return NextResponse.json({ success: true, data: normalize(fallbackSettings), storage: 'json-fallback' })
  try {
    const db = await getDb()
    const record = await db.collection('site_settings').findOne({ key: 'site' })
    return NextResponse.json({ success: true, data: normalize(record?.value || fallbackSettings), storage: 'mongodb' })
  } catch (error) {
    console.error('[admin/settings GET]', error)
    return NextResponse.json({ success: false, message: 'Không thể tải cài đặt MongoDB' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  if (!hasMongoConfig()) return NextResponse.json({ success: false, message: 'Cần kết nối MongoDB để lưu cài đặt' }, { status: 503 })
  try {
    const body = await request.json() as { settings?: unknown }
    const value = normalize(body.settings ?? body)
    value.updatedAt = new Date().toISOString()
    const db = await getDb()
    await db.collection('site_settings').updateOne(
      { key: 'site' },
      { $set: { key: 'site', value, updatedAt: value.updatedAt } },
      { upsert: true },
    )
    return NextResponse.json({ success: true, data: value })
  } catch (error) {
    console.error('[admin/settings PUT]', error)
    return NextResponse.json({ success: false, message: 'Không thể lưu cài đặt' }, { status: 500 })
  }
}
