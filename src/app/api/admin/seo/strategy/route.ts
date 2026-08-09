import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getSEOConfig, saveSEOConfig } from '@/lib/seo-strategy'

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
    revalidatePath('/', 'layout')
    revalidatePath('/llms.txt')
    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('[admin/seo/strategy PUT]', error)
    return NextResponse.json({ success: false, message: 'Không thể lưu chiến lược SEO/GEO/AIO' }, { status: 503 })
  }
}
