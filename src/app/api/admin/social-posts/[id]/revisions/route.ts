import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { listSocialPostRevisions } from '@/modules/social/application/social-post-service'
import { socialErrorResponse } from '@/modules/social/presentation/social-http'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    return NextResponse.json({ success: true, data: await listSocialPostRevisions((await params).id) })
  } catch (error) {
    return socialErrorResponse(error)
  }
}
