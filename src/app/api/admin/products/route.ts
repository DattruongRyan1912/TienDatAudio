import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getProducts } from '@/lib/catalog'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { createProduct, deleteProduct, updateProduct } from '@/lib/admin-repository'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

function revalidateCatalog() {
  revalidatePath('/', 'layout')
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  const id = new URL(request.url).searchParams.get('id')
  const data = await getProducts()
  return NextResponse.json(id ? data.find((product) => product.id === id) || null : data)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name || !body.category_id || !body.brand_id) {
      return NextResponse.json({ error: 'Tên, danh mục và thương hiệu là bắt buộc' }, { status: 400 })
    }
    const data = await createProduct({ ...body, name, slug: String(body.slug || slugify(name)) })
    revalidateCatalog()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[admin/products POST]', error)
    return NextResponse.json({ error: 'Không thể tạo sản phẩm. Hãy kiểm tra MongoDB.' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Thiếu product id' }, { status: 400 })
    const body = await request.json() as Record<string, unknown>
    const data = await updateProduct(id, { ...body, slug: String(body.slug || slugify(String(body.name || ''))) })
    if (!data) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    revalidateCatalog()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[admin/products PUT]', error)
    return NextResponse.json({ error: 'Không thể cập nhật sản phẩm' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Thiếu product id' }, { status: 400 })
    if (!(await deleteProduct(id))) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    revalidateCatalog()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/products DELETE]', error)
    return NextResponse.json({ error: 'Không thể xóa sản phẩm' }, { status: 503 })
  }
}
