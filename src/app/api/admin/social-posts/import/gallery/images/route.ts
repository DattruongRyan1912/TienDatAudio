import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { importPublicSocialGalleryImages } from '@/modules/social/application/social-link-preview'

export const runtime = 'nodejs'
export const maxDuration = 180

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const body = await request.json() as { sourceUrl?: unknown; images?: unknown }
    const data = await importPublicSocialGalleryImages(body.sourceUrl, body.images)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'PUBLIC_URL_REQUIRED') return NextResponse.json({ success: false, code, message: 'Hãy dán một liên kết Facebook public.' }, { status: 400 })
    if (code === 'PUBLIC_URL_INVALID' || code === 'FACEBOOK_URL_INVALID' || code === 'GALLERY_IMAGE_INVALID') return NextResponse.json({ success: false, code, message: 'Dữ liệu gallery không hợp lệ hoặc không thuộc Facebook CDN.' }, { status: 400 })
    if (code === 'GALLERY_IMAGES_REQUIRED') return NextResponse.json({ success: false, code, message: 'Hãy chọn ít nhất một ảnh trong gallery.' }, { status: 400 })
    if (code === 'PUBLIC_IMAGE_TOO_LARGE') return NextResponse.json({ success: false, code, message: 'Một ảnh vượt quá giới hạn 10MB.' }, { status: 413 })
    if (code === 'PUBLIC_IMAGE_UNSUPPORTED') return NextResponse.json({ success: false, code, message: 'Gallery có ảnh không thuộc định dạng được hỗ trợ.' }, { status: 415 })
    if (code === 'CLOUDINARY_REQUIRED') return NextResponse.json({ success: false, code, message: 'Cloudinary chưa được cấu hình trên server.' }, { status: 503 })
    if (code === 'CLOUDINARY_UPLOAD_FAILED') return NextResponse.json({ success: false, code, message: 'Không thể lưu gallery vào Cloudinary.' }, { status: 502 })
    console.error('[social-gallery-import]', code || 'GALLERY_IMAGE_IMPORT_FAILED')
    return NextResponse.json({ success: false, code: 'GALLERY_IMAGE_IMPORT_FAILED', message: 'Không thể lưu gallery ảnh.' }, { status: 422 })
  }
}
