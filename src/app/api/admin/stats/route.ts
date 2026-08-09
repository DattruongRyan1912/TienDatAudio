import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/catalog'
import { getGrowthDashboard } from '@/lib/analytics-repository'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const [catalog, growth] = await Promise.all([getDashboardStats(), getGrowthDashboard(30)])
  return NextResponse.json({ data: { ...catalog, growth } })
}
