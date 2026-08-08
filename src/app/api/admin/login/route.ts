import { NextResponse } from 'next/server'
import { createAdminSession, getAdminSession, getSessionCookieName, verifyAdminCredentials } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string }
    const username = String(body.username || '').trim()
    const password = String(body.password || '')

    if (username.length > 80 || password.length > 200 || !(await verifyAdminCredentials(username, password))) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(getSessionCookieName(), createAdminSession(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    response.cookies.delete('admin-auth')
    return response
  } catch (error) {
    console.error('[admin/login]', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi khi đăng nhập' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getAdminSession()
  return NextResponse.json({ authenticated: Boolean(session), username: session?.username || null })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(getSessionCookieName())
  response.cookies.delete('admin-auth')
  return response
}

