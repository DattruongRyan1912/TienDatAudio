import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/catalog'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const bestseller = searchParams.get('bestseller')
  const limit = Number(searchParams.get('limit') || 0)
  const products = await getProducts({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    featured: featured === null ? undefined : featured === 'true',
    bestseller: bestseller === null ? undefined : bestseller === 'true',
    limit: limit > 0 ? Math.min(limit, 100) : undefined,
  })

  return NextResponse.json({ data: products, count: products.length })
}

