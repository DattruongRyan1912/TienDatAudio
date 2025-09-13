import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface SEOContent {
  id: string
  page: string
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  structuredData: Record<string, unknown>
  metaRobots: string
  canonicalUrl: string
  h1: string
  h2: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const SEO_FILE = path.join(process.cwd(), 'data', 'seo.json')

// Ensure SEO file exists
function ensureSEOFile() {
  if (!fs.existsSync(SEO_FILE)) {
    const initialData = { seoContents: [] }
    fs.writeFileSync(SEO_FILE, JSON.stringify(initialData, null, 2))
  }
}

function getSEOContents(): SEOContent[] {
  try {
    ensureSEOFile()
    const data = fs.readFileSync(SEO_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.seoContents || []
  } catch (error) {
    console.error('Error reading SEO file:', error)
    return []
  }
}

function saveSEOContents(seoContents: SEOContent[]) {
  try {
    // Backup creation disabled to avoid multiple backup files
    // if (fs.existsSync(SEO_FILE)) {
    //   const backupFile = SEO_FILE.replace('.json', `-backup-${Date.now()}.json`)
    //   fs.copyFileSync(SEO_FILE, backupFile)
    // }

    const data = { seoContents }
    fs.writeFileSync(SEO_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving SEO file:', error)
    return false
  }
}

// GET - Lấy danh sách cấu hình SEO
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const active = searchParams.get('active')
    
    let seoContents = getSEOContents()
    
    // Filter by page if specified
    if (page) {
      seoContents = seoContents.filter(seo => seo.page === page)
    }
    
    // Filter by active status if specified
    if (active !== null) {
      const isActive = active === 'true'
      seoContents = seoContents.filter(seo => seo.isActive === isActive)
    }
    
    // Sort by updatedAt desc
    seoContents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({
      success: true,
      data: seoContents,
      total: seoContents.length
    })
  } catch (error) {
    console.error('Error in GET /api/admin/seo:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách cấu hình SEO' },
      { status: 500 }
    )
  }
}

// POST - Thêm cấu hình SEO mới
export async function POST(request: NextRequest) {
  try {
    const { seo } = await request.json()
    
    if (!seo || !seo.page || !seo.title) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc (page, title)' },
        { status: 400 }
      )
    }

    const seoContents = getSEOContents()
    
    // Check if page already has SEO config
    const existingSEO = seoContents.find(item => item.page === seo.page)
    if (existingSEO) {
      return NextResponse.json(
        { success: false, message: 'Trang này đã có cấu hình SEO' },
        { status: 400 }
      )
    }
    
    // Generate new ID
    const newId = `seo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newSEO: SEOContent = {
      id: newId,
      page: seo.page,
      title: seo.title,
      description: seo.description || '',
      keywords: seo.keywords || [],
      ogTitle: seo.ogTitle || seo.title,
      ogDescription: seo.ogDescription || seo.description || '',
      ogImage: seo.ogImage || '/images/og-default.jpg',
      structuredData: seo.structuredData || {},
      metaRobots: seo.metaRobots || 'index,follow',
      canonicalUrl: seo.canonicalUrl || '',
      h1: seo.h1 || seo.title,
      h2: seo.h2 || [],
      isActive: seo.isActive !== undefined ? seo.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    seoContents.push(newSEO)
    
    const saved = saveSEOContents(seoContents)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi lưu cấu hình SEO' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thêm cấu hình SEO thành công',
      data: newSEO
    })
  } catch (error) {
    console.error('Error in POST /api/admin/seo:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi thêm cấu hình SEO' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật cấu hình SEO
export async function PUT(request: NextRequest) {
  try {
    const { seo } = await request.json()
    
    if (!seo || !seo.id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID cấu hình SEO' },
        { status: 400 }
      )
    }

    const seoContents = getSEOContents()
    const seoIndex = seoContents.findIndex(item => item.id === seo.id)
    
    if (seoIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình SEO' },
        { status: 404 }
      )
    }
    
    // Update the SEO content
    seoContents[seoIndex] = {
      ...seoContents[seoIndex],
      ...seo,
      id: seoContents[seoIndex].id, // Keep original ID
      createdAt: seoContents[seoIndex].createdAt, // Keep original created date
      updatedAt: new Date().toISOString()
    }
    
    const saved = saveSEOContents(seoContents)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi cập nhật cấu hình SEO' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình SEO thành công',
      data: seoContents[seoIndex]
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/seo:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật cấu hình SEO' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa cấu hình SEO
export async function DELETE(request: NextRequest) {
  try {
    const { seoId } = await request.json()
    
    if (!seoId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID cấu hình SEO' },
        { status: 400 }
      )
    }

    const seoContents = getSEOContents()
    const initialLength = seoContents.length
    const filteredSEO = seoContents.filter(seo => seo.id !== seoId)
    
    if (filteredSEO.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình SEO để xóa' },
        { status: 404 }
      )
    }
    
    const saved = saveSEOContents(filteredSEO)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi xóa cấu hình SEO' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa cấu hình SEO thành công'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/seo:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa cấu hình SEO' },
      { status: 500 }
    )
  }
}
