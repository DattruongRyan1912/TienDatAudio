import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string
  isMain: boolean
  sortOrder: number
  createdAt: string
}

const IMAGES_FILE = path.join(process.cwd(), 'data', 'images.json')

// Ensure images file exists
function ensureImagesFile() {
  if (!fs.existsSync(IMAGES_FILE)) {
    const initialData = { images: [] }
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(initialData, null, 2))
  }
}

function getImages(): ProductImage[] {
  try {
    ensureImagesFile()
    const data = fs.readFileSync(IMAGES_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.images || []
  } catch (error) {
    console.error('Error reading images file:', error)
    return []
  }
}

function saveImages(images: ProductImage[]) {
  try {
    // Create backup
    if (fs.existsSync(IMAGES_FILE)) {
      const backupFile = IMAGES_FILE.replace('.json', `-backup-${Date.now()}.json`)
      fs.copyFileSync(IMAGES_FILE, backupFile)
    }

    const data = { images }
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving images file:', error)
    return false
  }
}

// GET - Lấy danh sách hình ảnh
export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    let images = getImages()
    
    // Filter by product if specified
    if (productId) {
      images = images.filter(img => img.productId === productId)
    }
    
    // Sort by sortOrder
    images.sort((a, b) => a.sortOrder - b.sortOrder)

    return NextResponse.json({
      success: true,
      data: images,
      total: images.length
    })
  } catch (error) {
    console.error('Error in GET /api/admin/images:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách hình ảnh' },
      { status: 500 }
    )
  }
}

// POST - Thêm hình ảnh mới
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { image } = await request.json()
    
    if (!image || !image.productId || !image.url || !image.alt) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    const images = getImages()
    
    // Generate new ID
    const newId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // If this is set as main image, remove main status from other images of the same product
    if (image.isMain) {
      images.forEach(img => {
        if (img.productId === image.productId) {
          img.isMain = false
        }
      })
    }
    
    const newImage: ProductImage = {
      id: newId,
      productId: image.productId,
      url: image.url,
      alt: image.alt,
      isMain: image.isMain || false,
      sortOrder: image.sortOrder || 0,
      createdAt: new Date().toISOString()
    }
    
    images.push(newImage)
    
    const saved = saveImages(images)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi lưu hình ảnh' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thêm hình ảnh thành công',
      data: newImage
    })
  } catch (error) {
    console.error('Error in POST /api/admin/images:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi thêm hình ảnh' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật hình ảnh
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { image } = await request.json()
    
    if (!image || !image.id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID hình ảnh' },
        { status: 400 }
      )
    }

    const images = getImages()
    const imageIndex = images.findIndex(img => img.id === image.id)
    
    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hình ảnh' },
        { status: 404 }
      )
    }
    
    // If this is set as main image, remove main status from other images of the same product
    if (image.isMain) {
      images.forEach(img => {
        if (img.productId === image.productId && img.id !== image.id) {
          img.isMain = false
        }
      })
    }
    
    // Update the image
    images[imageIndex] = {
      ...images[imageIndex],
      ...image,
      id: images[imageIndex].id, // Keep original ID
      createdAt: images[imageIndex].createdAt // Keep original created date
    }
    
    const saved = saveImages(images)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi cập nhật hình ảnh' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật hình ảnh thành công',
      data: images[imageIndex]
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/images:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật hình ảnh' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa hình ảnh
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { imageId } = await request.json()
    
    if (!imageId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID hình ảnh' },
        { status: 400 }
      )
    }

    const images = getImages()
    const initialLength = images.length
    const filteredImages = images.filter(img => img.id !== imageId)
    
    if (filteredImages.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hình ảnh để xóa' },
        { status: 404 }
      )
    }
    
    const saved = saveImages(filteredImages)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi xóa hình ảnh' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa hình ảnh thành công'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/images:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa hình ảnh' },
      { status: 500 }
    )
  }
}
