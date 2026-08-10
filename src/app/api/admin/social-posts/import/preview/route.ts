import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { previewPublicSocialLink } from '@/modules/social/application/social-link-preview'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const body = await request.json() as { url?: unknown }
    const data = await previewPublicSocialLink(body.url)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'PUBLIC_URL_REQUIRED') return NextResponse.json({ success: false, code, message: 'Hãy dán một liên kết public.' }, { status: 400 })
    if (code === 'PUBLIC_URL_INVALID') return NextResponse.json({ success: false, code, message: 'Chỉ hỗ trợ URL HTTP/HTTPS public, không chứa địa chỉ nội bộ.' }, { status: 400 })
    console.error('[social-link-preview]', error)
    return NextResponse.json({ success: false, code: 'LINK_PREVIEW_FAILED', message: 'Không thể tạo preview liên kết.' }, { status: 422 })
  }
}
