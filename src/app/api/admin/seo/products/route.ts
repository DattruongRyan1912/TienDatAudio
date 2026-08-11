import { NextRequest, NextResponse } from 'next/server'
import type { ProductSEO } from '@/lib/data'
import { getProductById } from '@/lib/catalog'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { updateProduct } from '@/lib/admin-repository'
import { refreshProductDiscovery } from '@/lib/catalog-publishing'

export const runtime = 'nodejs'

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeSEO(value: unknown): ProductSEO {
  const input = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const schemaMarkup = input.schemaMarkup && typeof input.schemaMarkup === 'object' && !Array.isArray(input.schemaMarkup)
    ? input.schemaMarkup as Record<string, unknown>
    : undefined

  return {
    metaTitle: text(input.metaTitle, 160),
    metaDescription: text(input.metaDescription, 320),
    keywords: Array.isArray(input.keywords)
      ? Array.from(new Set(input.keywords.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 100)).filter(Boolean))).slice(0, 20)
      : [],
    ogTitle: text(input.ogTitle, 160),
    ogDescription: text(input.ogDescription, 320),
    ogImage: text(input.ogImage, 1_000),
    canonicalUrl: text(input.canonicalUrl, 1_000),
    noIndex: Boolean(input.noIndex),
    ...(schemaMarkup ? { schemaMarkup } : {}),
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const productId = new URL(request.url).searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })

    const seo = normalizeSEO(await request.json())
    if (!seo.metaTitle || !seo.metaDescription) {
      return NextResponse.json({ error: 'Meta title and description are required' }, { status: 400 })
    }

    const product = await updateProduct(productId, { seo })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    await refreshProductDiscovery(product.slug)
    return NextResponse.json({ success: true, message: 'Product SEO updated successfully', product })
  } catch (error) {
    console.error('[admin/seo/products PUT]', error)
    return NextResponse.json({ error: 'Không thể lưu SEO sản phẩm. Hãy kiểm tra MongoDB.' }, { status: 503 })
  }
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const productId = new URL(request.url).searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })

    const product = await getProductById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ success: true, seo: product.seo || null })
  } catch (error) {
    console.error('[admin/seo/products GET]', error)
    return NextResponse.json({ error: 'Không thể đọc SEO sản phẩm' }, { status: 503 })
  }
}
