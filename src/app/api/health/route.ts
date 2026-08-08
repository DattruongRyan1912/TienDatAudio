import { NextResponse } from 'next/server'
import { getDb, hasMongoConfig } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const release = process.env.APP_RELEASE || 'development'

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { status: 'unhealthy', service: 'tiendataudio', release },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    return NextResponse.json(
      { status: 'ok', service: 'tiendataudio', release },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    console.error('[health] MongoDB ping failed')
    return NextResponse.json(
      { status: 'unhealthy', service: 'tiendataudio', release },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
