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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing file:', error)
    return false
  }
}

// PUT - Update product SEO
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const seoData: ProductSEO = await request.json()
    
    // Validate SEO data
    if (!seoData.metaTitle || !seoData.metaDescription) {
      return NextResponse.json({ 
        error: 'Meta title and description are required' 
      }, { status: 400 })
    }
    
    // Read all product files to find the product
    const speakersPath = path.join(process.cwd(), 'data', 'products', 'speakers.json')
    const amplifiersPath = path.join(process.cwd(), 'data', 'products', 'amplifiers.json')
    
    const speakersData = readProductFile(speakersPath)
    const amplifiersData = readProductFile(amplifiersPath)
    
    if (!speakersData || !amplifiersData) {
      return NextResponse.json({ error: 'Failed to read product data' }, { status: 500 })
    }
    
    // Find and update product SEO in speakers
    let found = false
    let updatedProduct: Product | null = null
    
    if (speakersData.speakers) {
      const productIndex = speakersData.speakers.findIndex((p: Product) => p.id === productId)
      if (productIndex !== -1) {
        speakersData.speakers[productIndex] = {
          ...speakersData.speakers[productIndex],
          seo: seoData,
          updatedAt: new Date().toISOString()
        }
        updatedProduct = speakersData.speakers[productIndex]
        found = true
        
        if (!writeProductFile(speakersPath, speakersData)) {
          return NextResponse.json({ error: 'Failed to save speakers data' }, { status: 500 })
        }
      }
    }
    
    // If not found in speakers, check amplifiers
    if (!found && amplifiersData.amplifiers) {
      const productIndex = amplifiersData.amplifiers.findIndex((p: Product) => p.id === productId)
      if (productIndex !== -1) {
        amplifiersData.amplifiers[productIndex] = {
          ...amplifiersData.amplifiers[productIndex],
          seo: seoData,
          updatedAt: new Date().toISOString()
        }
        updatedProduct = amplifiersData.amplifiers[productIndex]
        found = true
        
        if (!writeProductFile(amplifiersPath, amplifiersData)) {
          return NextResponse.json({ error: 'Failed to save amplifiers data' }, { status: 500 })
        }
      }
    }
    
    if (!found || !updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product SEO updated successfully',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/seo/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get product SEO data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
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
    
    // Find product in speakers
    if (speakersData.speakers) {
      const product = speakersData.speakers.find((p: Product) => p.id === productId)
      if (product) {
        return NextResponse.json({
          success: true,
          seo: product.seo || null
        })
      }
    }
    
    // Find product in amplifiers
    if (amplifiersData.amplifiers) {
      const product = amplifiersData.amplifiers.find((p: Product) => p.id === productId)
      if (product) {
        return NextResponse.json({
          success: true,
          seo: product.seo || null
        })
      }
    }
    
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  } catch (error) {
    console.error('Error in GET /api/admin/seo/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
