import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getBusinessProfile, saveBusinessProfile } from '@/lib/business-profile'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  return NextResponse.json({ success: true, data: await getBusinessProfile() })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { profile?: unknown }
    const profile = await saveBusinessProfile(body.profile ?? body)
    revalidatePath('/', 'layout')
    revalidatePath('/contact')
    revalidatePath('/about')
    revalidatePath('/llms.txt')
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'MONGODB_REQUIRED') {
      return NextResponse.json({ success: false, message: 'Cần kết nối MongoDB để lưu business profile' }, { status: 503 })
    }
    if (message.startsWith('VALIDATION:')) {
      return NextResponse.json({ success: false, message: message.slice('VALIDATION:'.length).split('|').join('. ') }, { status: 400 })
    }
    console.error('[admin/business-profile PUT]', error)
    return NextResponse.json({ success: false, message: 'Không thể lưu business profile' }, { status: 500 })
  }
}
