import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getNeo4jHealth } from '@/modules/knowledge-graph/infrastructure/neo4j-http-client'
import {
  applyGraphProjection,
  buildGraphProjectionSnapshot,
  syncPendingGraphOutbox,
  verifyGraphProjection,
} from '@/modules/knowledge-graph/infrastructure/graph-projection'

function graphError(error: unknown) {
  const code = error instanceof Error ? error.message : 'GRAPH_FAILED'
  return NextResponse.json({ success: false, code }, { status: code === 'MONGODB_REQUIRED' || code === 'NEO4J_NOT_CONFIGURED' ? 503 : 500 })
}

function graphAdminWritesEnabled() {
  if (process.env.NODE_ENV !== 'production') return true
  return process.env.ASSISTANT_GRAPH_ADMIN_WRITES_ENABLED?.trim().toLowerCase() === 'true'
}

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  return NextResponse.json({ success: true, data: await getNeo4jHealth() })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { action?: 'verify' | 'sync' | 'rebuild'; confirmation?: string }
    if (body.action === 'verify') return NextResponse.json({ success: true, data: await verifyGraphProjection() })
    if (!graphAdminWritesEnabled()) return NextResponse.json({ success: false, code: 'GRAPH_ADMIN_WRITES_DISABLED' }, { status: 403 })
    if (body.action === 'sync') return NextResponse.json({ success: true, data: await syncPendingGraphOutbox() })
    if (body.action === 'rebuild') {
      if (body.confirmation !== 'REBUILD_PROJECTION') return NextResponse.json({ success: false, code: 'GRAPH_REBUILD_CONFIRMATION_REQUIRED' }, { status: 400 })
      const snapshot = await buildGraphProjectionSnapshot()
      return NextResponse.json({ success: true, data: { counts: await applyGraphProjection(snapshot, { prune: true }), verification: await verifyGraphProjection(snapshot) } })
    }
    return NextResponse.json({ success: false, code: 'INVALID_ACTION' }, { status: 400 })
  } catch (error) {
    return graphError(error)
  }
}
