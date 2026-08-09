import speakersData from '../../data/products/speakers.json'
import amplifiersData from '../../data/products/amplifiers.json'
import categoriesData from '../../data/categories.json'
import brandsData from '../../data/brands.json'
import combosData from '../../data/combos.json'
import type { Brand, Category, Combo, Product, ProductSEO } from './data'
import { getContentPostBySlug, listContentPosts } from './content-repository'
import { getDb, hasMongoConfig } from './mongodb'

type CatalogFilters = {
  category?: string
  brand?: string
  search?: string
  featured?: boolean
  bestseller?: boolean
  limit?: number
}

const fallbackCategories = categoriesData.categories as Category[]
const fallbackBrands = brandsData as Brand[]

function normalizeProduct(raw: Record<string, unknown>): Product {
  const category = fallbackCategories.find((item) =>
    item.id === raw.category_id || item.slug === raw.category_id || item.name === raw.category,
  )
  const brand = fallbackBrands.find((item) =>
    item.id === raw.brand_id || item.slug === raw.brand_id || item.name === raw.brand,
  )
  const specifications: Record<string, string | string[]> = {}

  if (raw.specifications && typeof raw.specifications === 'object') {
    Object.entries(raw.specifications as Record<string, unknown>).forEach(([key, value]) => {
      if (Array.isArray(value)) specifications[key] = value.map(String)
      else if (value !== undefined && value !== null) specifications[key] = String(value)
    })
  }

  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    category_id: String(raw.category_id || category?.id || ''),
    brand_id: String(raw.brand_id || brand?.id || ''),
    category: category?.name || String(raw.category || ''),
    brand: brand?.name || String(raw.brand || ''),
    price: Number(raw.price) || 0,
    salePrice: raw.salePrice === null || raw.salePrice === undefined ? null : Number(raw.salePrice),
    images: Array.isArray(raw.images) ? raw.images.map(String) : [],
    specifications,
    description: String(raw.description || ''),
    features: Array.isArray(raw.features) ? raw.features.map(String) : [],
    inStock: Boolean(raw.inStock),
    featured: Boolean(raw.featured),
    bestseller: Boolean(raw.bestseller),
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
    seo: raw.seo as ProductSEO | undefined,
  }
}

function fallbackProducts() {
  return [
    ...speakersData.speakers.map((product) => normalizeProduct(product as unknown as Record<string, unknown>)),
    ...amplifiersData.amplifiers.map((product) => normalizeProduct(product as unknown as Record<string, unknown>)),
  ]
}

function matches(value: string | undefined, target: string) {
  return Boolean(value && (value === target || value.toLowerCase() === target.toLowerCase()))
}

function filterFallbackProducts(products: Product[], filters: CatalogFilters) {
  const filtered = products.filter((product) => {
    if (filters.category && !matches(product.category_id, filters.category) && !matches(product.category, filters.category)) return false
    if (filters.brand && !matches(product.brand_id, filters.brand) && !matches(product.brand, filters.brand)) return false
    if (filters.featured !== undefined && product.featured !== filters.featured) return false
    if (filters.bestseller !== undefined && product.bestseller !== filters.bestseller) return false
    if (filters.search) {
      const haystack = [product.name, product.description, product.brand, product.category, ...product.features].join(' ').toLowerCase()
      if (!haystack.includes(filters.search.toLowerCase())) return false
    }
    return true
  })

  return filters.limit ? filtered.slice(0, filters.limit) : filtered
}

async function fallbackOr<T>(fallback: () => T | Promise<T>, mongo: (db: Awaited<ReturnType<typeof getDb>>) => Promise<T>) {
  if (!hasMongoConfig()) return fallback()
  try {
    return await mongo(await getDb())
  } catch (error) {
    console.error('[catalog] MongoDB unavailable, using JSON fallback:', error)
    return fallback()
  }
}

export async function getProducts(filters: CatalogFilters = {}) {
  return fallbackOr(
    () => filterFallbackProducts(fallbackProducts(), filters),
    async (db) => {
      const query: Record<string, unknown> = {}
      const andConditions: Record<string, unknown>[] = []
      if (filters.category) andConditions.push({ $or: [{ category_id: filters.category }, { category: filters.category }] })
      if (filters.brand) andConditions.push({ $or: [{ brand_id: filters.brand }, { brand: filters.brand }] })
      if (filters.featured !== undefined) query.featured = filters.featured
      if (filters.bestseller !== undefined) query.bestseller = filters.bestseller
      if (filters.search) {
        andConditions.push({ $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { brand: { $regex: filters.search, $options: 'i' } },
          { category: { $regex: filters.search, $options: 'i' } },
        ] })
      }
      if (andConditions.length) query.$and = andConditions

      const documents = await db.collection('products').find(query).sort({ featured: -1, createdAt: -1 }).limit(filters.limit || 500).toArray()
      return documents.map((document) => normalizeProduct(document as unknown as Record<string, unknown>))
    },
  )
}

export async function getProductBySlug(slug: string) {
  return fallbackOr(
    () => fallbackProducts().find((product) => product.slug === slug) || null,
    async (db) => {
      const document = await db.collection('products').findOne({ slug })
      return document ? normalizeProduct(document as unknown as Record<string, unknown>) : null
    },
  )
}

export async function getFeaturedProducts(limit = 4) {
  return getProducts({ featured: true, limit })
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const product = await getProducts()
  const current = product.find((item) => item.id === productId)
  if (!current) return []
  return product.filter((item) => item.id !== productId && item.category_id === current.category_id).slice(0, limit)
}

export async function getCategories() {
  return fallbackOr(
    () => [...fallbackCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    async (db) => (await db.collection('categories').find({}).sort({ sortOrder: 1 }).toArray()) as unknown as Category[],
  )
}

export async function getBrands() {
  return fallbackOr(
    () => fallbackBrands.map((brand, index) => ({ ...brand, sortOrder: brand.sortOrder ?? index })),
    async (db) => {
      const [brands, counts] = await Promise.all([
        db.collection('brands').find({}).sort({ sortOrder: 1, name: 1 }).toArray(),
        db.collection('products').aggregate([{ $group: { _id: '$brand_id', count: { $sum: 1 } } }]).toArray(),
      ])
      const countMap = new Map(counts.map((item) => [String(item._id), Number(item.count)]))
      return brands.map((brand) => ({ ...brand, productCount: countMap.get(String(brand.id)) || 0 })) as unknown as Brand[]
    },
  )
}

export async function getBrandBySlug(slug: string) {
  const brands = await getBrands()
  return brands.find((brand) => brand.slug === slug || brand.id === slug) || null
}

export async function getCombos() {
  return fallbackOr(
    () => combosData as Combo[],
    async (db) => (await db.collection('combos').find({ status: 'active' }).sort({ featured: -1, createdAt: -1 }).toArray()) as unknown as Combo[],
  )
}

export async function getPosts(published = true) {
  return (await listContentPosts({ limit: 500 }, published)).items
}

export async function getPostBySlug(slug: string) {
  return getContentPostBySlug(slug)
}

export async function getDashboardStats() {
  return fallbackOr(
    async () => {
      const [products, categories, brands, leads] = await Promise.all([getProducts(), getCategories(), getBrands(), Promise.resolve([])])
      return { products: products.length, categories: categories.length, brands: brands.length, leads: leads.length }
    },
    async (db) => {
      const [products, categories, brands, leads] = await Promise.all([
        db.collection('products').countDocuments(),
        db.collection('categories').countDocuments(),
        db.collection('brands').countDocuments(),
        db.collection('leads').countDocuments({ status: { $ne: 'archived' } }),
      ])
      return { products, categories, brands, leads }
    },
  )
}
