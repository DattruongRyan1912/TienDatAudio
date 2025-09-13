import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json')

interface CategoryData {
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string
    image: string
    sortOrder: number
  }>
}

// Helper function to read categories
async function readCategories(): Promise<CategoryData> {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading categories:', error)
    return { categories: [] }
  }
}

// Helper function to write categories
async function writeCategories(data: CategoryData): Promise<void> {
  try {
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing categories:', error)
    throw error
  }
}

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const data = await readCategories()
    return NextResponse.json(data.categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Không thể tải danh mục' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, image, sortOrder } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Tên và mô tả là bắt buộc' },
        { status: 400 }
      )
    }

    const data = await readCategories()

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = data.categories.find(cat => cat.slug === slug)
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Danh mục với tên này đã tồn tại' },
        { status: 400 }
      )
    }

    const newCategory = {
      id: Date.now().toString(),
      name,
      slug,
      description,
      image: image || '',
      sortOrder: sortOrder || data.categories.length + 1
    }

    data.categories.push(newCategory)
    await writeCategories(data)

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Không thể tạo danh mục' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories?id=xxx - Update category
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID danh mục là bắt buộc' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, image, sortOrder } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Tên và mô tả là bắt buộc' },
        { status: 400 }
      )
    }

    const data = await readCategories()
    const categoryIndex = data.categories.findIndex(cat => cat.id === id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists (excluding current category)
    const existingCategory = data.categories.find(cat =>
      cat.slug === slug && cat.id !== id
    )
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Danh mục với tên này đã tồn tại' },
        { status: 400 }
      )
    }

    data.categories[categoryIndex] = {
      ...data.categories[categoryIndex],
      name,
      slug,
      description,
      image: image || data.categories[categoryIndex].image,
      sortOrder: sortOrder || data.categories[categoryIndex].sortOrder
    }

    await writeCategories(data)

    return NextResponse.json(data.categories[categoryIndex])
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật danh mục' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories?id=xxx - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID danh mục là bắt buộc' },
        { status: 400 }
      )
    }

    const data = await readCategories()
    const categoryIndex = data.categories.findIndex(cat => cat.id === id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      )
    }

    const deletedCategory = data.categories[categoryIndex]
    data.categories.splice(categoryIndex, 1)

    await writeCategories(data)

    return NextResponse.json(deletedCategory)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Không thể xóa danh mục' },
      { status: 500 }
    )
  }
}
