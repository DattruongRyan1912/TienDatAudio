import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/catalog'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  return NextResponse.json({ data: await getDashboardStats() })
}

