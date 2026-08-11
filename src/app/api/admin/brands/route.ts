import { NextResponse } from 'next/server'
import { getBrands } from '@/lib/catalog'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { deleteBrand, getBrandSlugById, upsertBrand } from '@/lib/admin-repository'
import { refreshBrandDiscovery } from '@/lib/catalog-publishing'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(await getBrands())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'Tên thương hiệu là bắt buộc' }, { status: 400 })
    const data = await upsertBrand({ ...body, name, slug: String(body.slug || slugify(name)) })
    await refreshBrandDiscovery(data.slug)
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Không thể lưu thương hiệu' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as Record<string, unknown>
    if (!body.id) return NextResponse.json({ error: 'Thiếu brand id' }, { status: 400 })
    const previousSlug = await getBrandSlugById(String(body.id))
    const data = await upsertBrand({ ...body, slug: String(body.slug || slugify(String(body.name || ''))) })
    await refreshBrandDiscovery(data.slug, previousSlug)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật thương hiệu' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Thiếu brand id' }, { status: 400 })
  const previousSlug = await getBrandSlugById(id)
  const success = await deleteBrand(id)
  if (success) await refreshBrandDiscovery(previousSlug)
  return NextResponse.json({ success })
}
