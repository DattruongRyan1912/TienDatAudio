import { NextResponse } from 'next/server'
import { createLead } from '@/lib/admin-repository'
import { hasMongoConfig } from '@/lib/mongodb'

export const runtime = 'nodejs'

function clean(value: unknown, max = 500) {
  return String(value || '').trim().slice(0, max)
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>
    const name = clean(body.name, 100)
    const phone = clean(body.phone, 30)
    const email = clean(body.email, 160)
    const message = clean(body.message, 2000)

    if (name.length < 2 || !/^0[0-9]{9,10}$/.test(phone)) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên và số điện thoại hợp lệ' }, { status: 400 })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }
    if (!hasMongoConfig()) {
      return NextResponse.json({ error: 'Hệ thống liên hệ chưa kết nối MongoDB' }, { status: 503 })
    }

    const lead = await createLead({
      name,
      phone,
      email: email || undefined,
      interest: clean(body.interest, 120),
      budget: clean(body.budget, 80),
      message,
      source: clean(body.source, 80) || 'website',
    })

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 })
  } catch (error) {
    console.error('[contact]', error)
    return NextResponse.json({ error: 'Không thể gửi yêu cầu lúc này' }, { status: 500 })
  }
}

