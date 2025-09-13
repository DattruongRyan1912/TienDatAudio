import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Types
interface ProductSEO {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

interface Product {
  id: string
  name: string
  slug: string
  category: string
  brand: string
  price: number
  salePrice?: number
  images: string[]
  specifications: Record<string, string | string[]>
  description: string
  features: string[]
  inStock: boolean
  featured: boolean
  bestseller: boolean
  seo?: ProductSEO
  createdAt: string
  updatedAt: string
}

// Helper function to get file path based on category
function getProductFilePath(category: string): string {
  const baseDir = path.join(process.cwd(), 'data', 'products')
  
  switch (category.toLowerCase()) {
    case 'loa':
      return path.join(baseDir, 'speakers.json')
    case 'ampli':
      return path.join(baseDir, 'amplifiers.json')
    default:
      return path.join(baseDir, 'speakers.json') // Default fallback
  }
}

// Helper function to read JSON file
function readProductFile(filePath: string): Record<string, Product[]> | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

// Helper function to write JSON file
function writeProductFile(filePath: string, data: Record<string, Product[]>): boolean {
  try {
    // Create backup
    const backupPath = filePath.replace('.json', '_backup.json')
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath)
    }
    
    // Write new data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing file:', error)
    return false
  }
}

// GET - Get all products or by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    // Read all product files
    const speakersPath = path.join(process.cwd(), 'data', 'products', 'speakers.json')
    const amplifiersPath = path.join(process.cwd(), 'data', 'products', 'amplifiers.json')
    
    const speakersData = readProductFile(speakersPath)
    const amplifiersData = readProductFile(amplifiersPath)
    
    if (!speakersData || !amplifiersData) {
      return NextResponse.json({ error: 'Failed to read product data' }, { status: 500 })
    }
    
    console.log('Speakers data keys:', Object.keys(speakersData))
    console.log('Amplifiers data keys:', Object.keys(amplifiersData))
    
    const allProducts = [
      ...(speakersData.speakers || []),
      ...(amplifiersData.amplifiers || [])
    ]
    
    console.log('Total products found:', allProducts.length)
    
    if (id) {
      const product = allProducts.find((p: Product) => p.id === id)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(product)
    }
    
    return NextResponse.json(allProducts)
  } catch (error) {
    console.error('Error in GET /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const productData: Partial<Product> = await request.json()
    
    // Validate required fields
    if (!productData.name || !productData.category || !productData.brand) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Generate ID and slug
    const id = Date.now().toString()
    const slug = productData.name!.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    const newProduct: Product = {
      id,
      slug,
      name: productData.name!,
      category: productData.category!,
      brand: productData.brand!,
      price: productData.price || 0,
      salePrice: productData.salePrice,
      images: productData.images || [],
      specifications: productData.specifications || {},
      description: productData.description || '',
      features: productData.features || [],
      inStock: productData.inStock ?? true,
      featured: productData.featured ?? false,
      bestseller: productData.bestseller ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Get the appropriate file path
    const filePath = getProductFilePath(productData.category!)
    const fileData = readProductFile(filePath)
    
    if (!fileData) {
      return NextResponse.json({ error: 'Failed to read product file' }, { status: 500 })
    }
    
    // Add product to appropriate array
    const key = productData.category!.toLowerCase() === 'loa' ? 'speakers' : 'amplifiers'
    if (!fileData[key]) {
      fileData[key] = []
    }
    fileData[key].push(newProduct)
    
    // Write back to file
    const success = writeProductFile(filePath, fileData)
    if (!success) {
      return NextResponse.json({ error: 'Failed to save product' }, { status: 500 })
    }
    
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing product
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const updateData: Partial<Product> = await request.json()
    
    // Read all product files to find the product
    const speakersPath = path.join(process.cwd(), 'data', 'products', 'speakers.json')
    const amplifiersPath = path.join(process.cwd(), 'data', 'products', 'amplifiers.json')
    
    const speakersData = readProductFile(speakersPath)
    const amplifiersData = readProductFile(amplifiersPath)
    
    if (!speakersData || !amplifiersData) {
      return NextResponse.json({ error: 'Failed to read product data' }, { status: 500 })
    }
    
    // Find and update product in speakers
    let found = false
    let updatedProduct: Product | null = null
    
    if (speakersData.speakers) {
      const productIndex = speakersData.speakers.findIndex((p: Product) => p.id === id)
      if (productIndex !== -1) {
        speakersData.speakers[productIndex] = {
          ...speakersData.speakers[productIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        }
        updatedProduct = speakersData.speakers[productIndex]
        found = true
        writeProductFile(speakersPath, speakersData)
      }
    }
    
    // If not found in speakers, check amplifiers
    if (!found && amplifiersData.amplifiers) {
      const productIndex = amplifiersData.amplifiers.findIndex((p: Product) => p.id === id)
      if (productIndex !== -1) {
        amplifiersData.amplifiers[productIndex] = {
          ...amplifiersData.amplifiers[productIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        }
        updatedProduct = amplifiersData.amplifiers[productIndex]
        found = true
        writeProductFile(amplifiersPath, amplifiersData)
      }
    }
    
    if (!found || !updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error in PUT /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // Read all product files to find the product
    const speakersPath = path.join(process.cwd(), 'data', 'products', 'speakers.json')
    const amplifiersPath = path.join(process.cwd(), 'data', 'products', 'amplifiers.json')
    
    const speakersData = readProductFile(speakersPath)
    const amplifiersData = readProductFile(amplifiersPath)
    
    if (!speakersData || !amplifiersData) {
      return NextResponse.json({ error: 'Failed to read product data' }, { status: 500 })
    }
    
    // Find and delete product from speakers
    let found = false
    
    if (speakersData.speakers) {
      const productIndex = speakersData.speakers.findIndex((p: Product) => p.id === id)
      if (productIndex !== -1) {
        speakersData.speakers.splice(productIndex, 1)
        found = true
        writeProductFile(speakersPath, speakersData)
      }
    }
    
    // If not found in speakers, check amplifiers
    if (!found && amplifiersData.amplifiers) {
      const productIndex = amplifiersData.amplifiers.findIndex((p: Product) => p.id === id)
      if (productIndex !== -1) {
        amplifiersData.amplifiers.splice(productIndex, 1)
        found = true
        writeProductFile(amplifiersPath, amplifiersData)
      }
    }
    
    if (!found) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
