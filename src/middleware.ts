import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin auth cookie
    const adminAuth = request.cookies.get('admin-auth')
    
    // If no auth cookie and not on login page, redirect to login
    if (!adminAuth && !request.nextUrl.pathname.includes('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // If has auth cookie and on login page, redirect to admin dashboard
    if (adminAuth && request.nextUrl.pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
