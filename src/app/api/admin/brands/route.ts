import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BRANDS_FILE = path.join(process.cwd(), 'data', 'brands.json')

interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  website: string
  country: string
  featured: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(BRANDS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load brands from file
const loadBrands = (): Brand[] => {
  ensureDataDir()
  if (fs.existsSync(BRANDS_FILE)) {
    const data = fs.readFileSync(BRANDS_FILE, 'utf8')
    const parsed = JSON.parse(data)
    // Handle both array format and object with brands property
    if (Array.isArray(parsed)) {
      return parsed
    } else if (parsed.brands && Array.isArray(parsed.brands)) {
      // Convert old format to new format
      return parsed.brands.map((brand: Record<string, unknown>) => ({
        id: brand.id || Date.now().toString(),
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        country: brand.country || '',
        featured: brand.featured || false,
        productCount: brand.productCount || 0,
        createdAt: brand.createdAt || new Date().toISOString(),
        updatedAt: brand.updatedAt || new Date().toISOString()
      }))
    }
  }
  return []
}

// Save brands to file
const saveBrands = (brands: Brand[]) => {
  ensureDataDir()
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(brands, null, 2))
}

// Calculate product count for each brand
const calculateProductCounts = (brands: Brand[]): Brand[] => {
  // Load all products to count actual products per brand
  try {
    const speakersPath = path.join(process.cwd(), 'data', 'products', 'speakers.json')
    const amplifiersPath = path.join(process.cwd(), 'data', 'products', 'amplifiers.json')
    
    let allProducts: { brand_id?: string; brand?: string }[] = []
    
    // Load speakers
    if (fs.existsSync(speakersPath)) {
      const speakersData = JSON.parse(fs.readFileSync(speakersPath, 'utf8'))
      if (speakersData.speakers) {
        allProducts = [...allProducts, ...speakersData.speakers]
      }
    }
    
    // Load amplifiers
    if (fs.existsSync(amplifiersPath)) {
      const amplifiersData = JSON.parse(fs.readFileSync(amplifiersPath, 'utf8'))
      if (amplifiersData.amplifiers) {
        allProducts = [...allProducts, ...amplifiersData.amplifiers]
      }
    }
    
    // Count products per brand
    return brands.map(brand => {
      const productCount = allProducts.filter(product => 
        product.brand_id === brand.id || product.brand_id === brand.slug
      ).length
      
      return {
        ...brand,
        productCount
      }
    })
  } catch (error) {
    console.error('Error calculating product counts:', error)
    // Fallback to existing productCount if error
    return brands
  }
}

export async function GET() {
  try {
    let brands = loadBrands()
    brands = calculateProductCounts(brands)
    
    return NextResponse.json({
      success: true,
      data: brands
    })
  } catch (error) {
    console.error('Error in brands GET:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách thương hiệu' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { brand } = await request.json()
    
    if (!brand.name || !brand.slug) {
      return NextResponse.json(
        { success: false, message: 'Tên thương hiệu và slug là bắt buộc' },
        { status: 400 }
      )
    }

    const brands = loadBrands()
    
    // Check if slug already exists
    if (brands.some(b => b.slug === brand.slug)) {
      return NextResponse.json(
        { success: false, message: 'Slug đã tồn tại' },
        { status: 400 }
      )
    }

    const newBrand: Brand = {
      id: Date.now().toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      country: brand.country || '',
      featured: brand.featured || false,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    brands.push(newBrand)
    saveBrands(brands)

    return NextResponse.json({
      success: true,
      message: 'Thêm thương hiệu thành công',
      data: newBrand
    })
  } catch (error) {
    console.error('Error in brands POST:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi thêm thương hiệu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { brand } = await request.json()
    
    if (!brand.id || !brand.name || !brand.slug) {
      return NextResponse.json(
        { success: false, message: 'ID, tên thương hiệu và slug là bắt buộc' },
        { status: 400 }
      )
    }

    const brands = loadBrands()
    const brandIndex = brands.findIndex(b => b.id === brand.id)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thương hiệu' },
        { status: 404 }
      )
    }

    // Check if slug already exists (excluding current brand)
    if (brands.some(b => b.slug === brand.slug && b.id !== brand.id)) {
      return NextResponse.json(
        { success: false, message: 'Slug đã tồn tại' },
        { status: 400 }
      )
    }

    const updatedBrand: Brand = {
      ...brands[brandIndex],
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      country: brand.country || '',
      featured: brand.featured || false,
      updatedAt: new Date().toISOString()
    }

    brands[brandIndex] = updatedBrand
    saveBrands(brands)

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thương hiệu thành công',
      data: updatedBrand
    })
  } catch (error) {
    console.error('Error in brands PUT:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật thương hiệu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { brandId } = await request.json()
    
    if (!brandId) {
      return NextResponse.json(
        { success: false, message: 'ID thương hiệu là bắt buộc' },
        { status: 400 }
      )
    }

    const brands = loadBrands()
    const brandIndex = brands.findIndex(b => b.id === brandId)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thương hiệu' },
        { status: 404 }
      )
    }

    brands.splice(brandIndex, 1)
    saveBrands(brands)

    return NextResponse.json({
      success: true,
      message: 'Xóa thương hiệu thành công'
    })
  } catch (error) {
    console.error('Error in brands DELETE:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa thương hiệu' },
      { status: 500 }
    )
  }
}
