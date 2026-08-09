import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { developmentSessionSecret } from '@/lib/session-secret'

const sessionCookie = 'sonic_admin_session'

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
}

async function verifyEdgeSession(token: string | undefined) {
  if (!token) return false
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : developmentSessionSecret)
  if (!secret) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const signatureBytes = Uint8Array.from(decodeBase64Url(signature), (char) => char.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(payload))
    if (!valid) return false
    const session = JSON.parse(decodeBase64Url(payload)) as { username?: string; exp?: number }
    return Boolean(session.username && session.exp && session.exp > Math.floor(Date.now() / 1000))
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')
  const isLoginPage = pathname === '/admin/login'
  const isLoginApi = pathname === '/api/admin/login'
  if (!isAdminPage && !isAdminApi) return NextResponse.next()

  const validSession = await verifyEdgeSession(request.cookies.get(sessionCookie)?.value)

  if (isLoginApi) return NextResponse.next()
  if (isAdminApi && !validSession) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  if (isAdminPage && !validSession && !isLoginPage) return NextResponse.redirect(new URL('/admin/login', request.url))
  if (isLoginPage && validSession) return NextResponse.redirect(new URL('/admin', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/upload/:path*'],
}
