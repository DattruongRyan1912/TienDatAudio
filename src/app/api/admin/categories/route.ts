import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCategories } from '@/lib/catalog'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { deleteCategory, upsertCategory } from '@/lib/admin-repository'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

function revalidateCatalog() {
  revalidatePath('/', 'layout')
}

export async function GET() {
  return NextResponse.json(await getCategories())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'Tên danh mục là bắt buộc' }, { status: 400 })
    const data = await upsertCategory({ ...body, name, slug: String(body.slug || slugify(name)) })
    revalidateCatalog()
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Không thể lưu danh mục' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as Record<string, unknown>
    if (!body.id) return NextResponse.json({ error: 'Thiếu category id' }, { status: 400 })
    const data = await upsertCategory({ ...body, slug: String(body.slug || slugify(String(body.name || ''))) })
    revalidateCatalog()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật danh mục' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Thiếu category id' }, { status: 400 })
  const success = await deleteCategory(id)
  if (success) revalidateCatalog()
  return NextResponse.json({ success })
}
