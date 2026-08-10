import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import type { Product } from '../src/lib/data'
import { generateProductStructuredData, generateSEOMetadata, getProductCanonicalPath } from '../src/lib/seo'
import { buildOpeningHoursSpecification } from '../src/lib/seo-strategy'

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'ARF X12Pro',
    slug: 'arf-x12pro',
    category_id: 'loa-thung',
    brand_id: 'arf',
    category: 'Loa Thùng',
    brand: 'ARF',
    price: 20_000_000,
    salePrice: null,
    images: ['/uploads/product.jpg'],
    specifications: {},
    description: 'Loa thùng chuyên nghiệp dành cho hệ thống âm thanh cần độ ổn định cao.',
    features: [],
    inStock: true,
    featured: false,
    bestseller: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
    ...overrides,
  }
}

test('shared SEO metadata derives canonical and social cards from the current route', () => {
  const metadata = generateSEOMetadata({
    pagePath: '/brands',
    title: 'Thương hiệu — Tiến Đạt Audio',
    description: 'Thương hiệu được tuyển chọn.',
  })
  assert.equal(metadata.alternates?.canonical, 'https://tiendataudioquangngai.id.vn/brands')
  assert.equal(metadata.openGraph?.url, 'https://tiendataudioquangngai.id.vn/brands')
  assert.deepEqual(metadata.twitter?.images, ['https://tiendataudioquangngai.id.vn/images/og-default.jpg'])
})

test('product schema uses the public route and never fabricates ratings', () => {
  const schema = generateProductStructuredData(product()) as { '@graph': Array<Record<string, unknown>> }
  const productNode = schema['@graph'].find((item) => item['@type'] === 'Product')
  const breadcrumb = schema['@graph'].find((item) => item['@type'] === 'BreadcrumbList')
  assert.equal(productNode?.url, 'https://tiendataudioquangngai.id.vn/san-pham/arf-x12pro')
  assert.equal((productNode?.offers as { price?: string })?.price, '20000000')
  assert.equal(productNode?.aggregateRating, undefined)
  assert.match(JSON.stringify(breadcrumb), /\/san-pham\/arf-x12pro/)
})

test('products without a configured price omit Offer and keep contact-price semantics', () => {
  const item = product({ price: 0, salePrice: null })
  const schema = generateProductStructuredData(item) as { '@graph': Array<Record<string, unknown>> }
  const productNode = schema['@graph'].find((entry) => entry['@type'] === 'Product')
  assert.equal(productNode?.offers, undefined)
})

test('legacy product canonicals are normalized to the public san-pham route', () => {
  assert.equal(getProductCanonicalPath(product({ seo: { canonicalUrl: '/product/arf-x12pro' } })), '/san-pham/arf-x12pro')
})

test('Vietnamese business hours become schema.org OpeningHoursSpecification', () => {
  const result = buildOpeningHoursSpecification(['Thứ 2 - Chủ nhật: 08:00 - 22:00'])
  assert.equal(result.length, 1)
  assert.equal(result[0].opens, '08:00')
  assert.equal(result[0].closes, '22:00')
  assert.equal(result[0].dayOfWeek.length, 7)
})

test('SEO sources no longer contain the retired Vercel domain or product route', () => {
  const staticSEO = readFileSync(new URL('../src/lib/seo-static.ts', import.meta.url), 'utf8')
  const seoSource = readFileSync(new URL('../src/lib/seo.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(staticSEO, /tien-dat-audio\.vercel\.app/)
  assert.doesNotMatch(seoSource, /canonicalUrl:\s*`?\/product\//)
})
