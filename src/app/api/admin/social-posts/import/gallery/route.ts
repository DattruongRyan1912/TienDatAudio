import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { scanFacebookSocialGallery } from '@/modules/social/application/social-link-preview'

export const runtime = 'nodejs'
export const maxDuration = 180

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  if (process.env.SOCIAL_FACEBOOK_WORKER_ENABLED !== 'true') {
    return NextResponse.json({ success: false, code: 'FACEBOOK_WORKER_DISABLED', message: 'Gallery worker chỉ được bật ở local để giữ production dùng official embed.' }, { status: 503 })
  }

  try {
    const body = await request.json() as { url?: unknown; mode?: unknown }
    const mode = body.mode === 'manual' ? 'manual' : 'public'
    const data = await scanFacebookSocialGallery(body.url, {
      browserMode: mode === 'manual' ? 'cdp' : 'temporary',
      headed: mode === 'manual',
      waitForLogin: mode === 'manual',
      maxImages: 50,
      storageStatePath: mode === 'manual' ? undefined : process.env.SOCIAL_FACEBOOK_STORAGE_STATE_PATH,
      storageStateRequired: false,
      saveStorageStatePath: undefined,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'PUBLIC_URL_REQUIRED') return NextResponse.json({ success: false, code, message: 'Hãy dán một liên kết public.' }, { status: 400 })
    if (code === 'PUBLIC_URL_INVALID' || code === 'FACEBOOK_URL_INVALID') return NextResponse.json({ success: false, code, message: 'Chỉ hỗ trợ liên kết Facebook public hợp lệ.' }, { status: 400 })
    if (code === 'FACEBOOK_WORKER_DISABLED') return NextResponse.json({ success: false, code, message: 'Gallery worker đang tắt trên môi trường này.' }, { status: 503 })
    if (code === 'FACEBOOK_LOGIN_REQUIRED') return NextResponse.json({ success: false, code, message: 'Profile tạm chưa đăng nhập hoặc Facebook chưa mở gallery.' }, { status: 422 })
    if (code === 'FACEBOOK_STORAGE_STATE_PATH_INVALID') return NextResponse.json({ success: false, code, message: 'Session Facebook local phải nằm trong thư mục .local/facebook.' }, { status: 503 })
    if (code === 'FACEBOOK_STORAGE_STATE_NOT_FOUND') return NextResponse.json({ success: false, code, message: 'Chưa tìm thấy session Facebook local. Hãy tạo storage state local hoặc xoá cấu hình để đăng nhập thủ công.' }, { status: 503 })
    if (code === 'FACEBOOK_STORAGE_STATE_INVALID') return NextResponse.json({ success: false, code, message: 'Session Facebook local không hợp lệ hoặc đã hỏng. Hãy tạo lại session state.' }, { status: 503 })
    if (code === 'FACEBOOK_NAVIGATION_FAILED') return NextResponse.json({ success: false, code, message: 'Không mở được Facebook trong profile tạm. Hãy thử lại sau vài giây.' }, { status: 502 })
    if (code === 'FACEBOOK_GALLERY_NOT_FOUND') return NextResponse.json({ success: false, code, message: 'Không tìm thấy gallery ảnh public sau khi trang render.' }, { status: 422 })
    if (code === 'FACEBOOK_CDP_DISABLED') return NextResponse.json({ success: false, code, message: 'CDP Chrome local đang tắt. Hãy bật Remote Debugging rồi thử lại.' }, { status: 503 })
    if (code === 'FACEBOOK_CDP_ACTIVE_PORT_NOT_FOUND') return NextResponse.json({ success: false, code, message: 'Không tìm thấy phiên CDP Chrome local. Hãy bật Remote Debugging trong Chrome rồi thử lại.' }, { status: 503 })
    if (code === 'FACEBOOK_CDP_ACTIVE_PORT_PATH_INVALID' || code === 'FACEBOOK_CDP_ACTIVE_PORT_INVALID' || code === 'FACEBOOK_CDP_CONTEXT_NOT_FOUND') return NextResponse.json({ success: false, code, message: 'Cấu hình CDP Chrome local không hợp lệ.' }, { status: 503 })
    if (code === 'FACEBOOK_CDP_CONNECT_FAILED') return NextResponse.json({ success: false, code, message: 'Không thể kết nối vào Chrome hiện tại. Hãy giữ Chrome mở và thử lại.' }, { status: 503 })
    console.error('[social-facebook-gallery]', code || 'FACEBOOK_GALLERY_FAILED')
    return NextResponse.json({ success: false, code: 'FACEBOOK_GALLERY_FAILED', message: 'Không thể quét gallery Facebook.' }, { status: 422 })
  }
}
