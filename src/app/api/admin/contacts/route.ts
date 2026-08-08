import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { listLeads, updateLead, serializeMongoDocument } from '@/lib/admin-repository'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const data = (await listLeads()).map((lead) => serializeMongoDocument(lead as unknown as Record<string, unknown>))
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[admin/contacts GET]', error)
    return NextResponse.json({ error: 'Chưa kết nối được MongoDB' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { id?: string; status?: string }
    if (!body.id || !['new', 'contacted', 'qualified', 'closed', 'archived'].includes(String(body.status))) {
      return NextResponse.json({ error: 'Dữ liệu trạng thái không hợp lệ' }, { status: 400 })
    }
    const lead = await updateLead(body.id, { status: body.status })
    if (!lead) return NextResponse.json({ error: 'Không tìm thấy liên hệ' }, { status: 404 })
    return NextResponse.json({ data: serializeMongoDocument(lead as unknown as Record<string, unknown>) })
  } catch (error) {
    console.error('[admin/contacts PUT]', error)
    return NextResponse.json({ error: 'Không thể cập nhật liên hệ' }, { status: 500 })
  }
}

