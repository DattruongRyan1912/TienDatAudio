import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { contentErrorResponse } from '@/lib/content-http'
import { listPostRevisions } from '@/lib/content-repository'

type Context = { params: Promise<unknown> }

export async function GET(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    return NextResponse.json({ success: true, data: await listPostRevisions(String(((await params) as { id?: string }).id || '')) })
  } catch (error) {
    return contentErrorResponse(error)
  }
}
