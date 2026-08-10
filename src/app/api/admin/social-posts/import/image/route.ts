import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { importPublicSocialLinkImage } from '@/modules/social/application/social-link-preview'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const body = await request.json() as { url?: unknown }
    const data = await importPublicSocialLinkImage(body.url)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'PUBLIC_URL_REQUIRED') return NextResponse.json({ success: false, code, message: 'Hãy dán một liên kết public.' }, { status: 400 })
    if (code === 'PUBLIC_URL_INVALID') return NextResponse.json({ success: false, code, message: 'Chỉ hỗ trợ URL HTTP/HTTPS public, không chứa địa chỉ nội bộ.' }, { status: 400 })
    if (code === 'PUBLIC_IMAGE_MISSING') return NextResponse.json({ success: false, code, message: 'Liên kết không có ảnh public để lưu.' }, { status: 422 })
    if (code === 'PUBLIC_IMAGE_TOO_LARGE') return NextResponse.json({ success: false, code, message: 'Ảnh vượt quá giới hạn 10MB.' }, { status: 413 })
    if (code === 'PUBLIC_IMAGE_UNSUPPORTED') return NextResponse.json({ success: false, code, message: 'Nguồn không trả về định dạng ảnh được hỗ trợ.' }, { status: 415 })
    if (code === 'PUBLIC_IMAGE_REDIRECT_LIMIT') return NextResponse.json({ success: false, code, message: 'Ảnh chuyển hướng quá nhiều lần.' }, { status: 422 })
    if (code === 'PUBLIC_IMAGE_UNAVAILABLE') return NextResponse.json({ success: false, code, message: 'Không thể tải ảnh public từ nguồn.' }, { status: 422 })
    if (code === 'CLOUDINARY_REQUIRED') return NextResponse.json({ success: false, code, message: 'Cloudinary chưa được cấu hình trên server.' }, { status: 503 })
    if (code === 'CLOUDINARY_UPLOAD_FAILED') return NextResponse.json({ success: false, code, message: 'Không thể lưu ảnh vào Cloudinary.' }, { status: 502 })
    console.error('[social-image-import]', error)
    return NextResponse.json({ success: false, code: 'IMAGE_IMPORT_FAILED', message: 'Không thể lưu ảnh từ liên kết.' }, { status: 422 })
  }
}
