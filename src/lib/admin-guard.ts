import { NextResponse } from 'next/server'
import { getAdminSession } from './auth'

export async function requireAdmin() {
  return getAdminSession()
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
}

