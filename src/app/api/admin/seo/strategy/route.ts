import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getSEOConfig, saveSEOConfig } from '@/lib/seo-strategy'
import { PUBLIC_SITE_SETTINGS_CACHE_TAG } from '@/lib/public-site-settings'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  return NextResponse.json({ success: true, data: await getSEOConfig() })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { config?: unknown }
    const config = await saveSEOConfig(body.config ?? body)
    revalidateTag(PUBLIC_SITE_SETTINGS_CACHE_TAG)
    revalidatePath('/', 'layout')
    revalidatePath('/llms.txt')
    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('[admin/seo/strategy PUT]', error)
    return NextResponse.json({ success: false, message: 'Không thể lưu chiến lược SEO/GEO/AIO' }, { status: 503 })
  }
}
