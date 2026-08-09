import type { Brand, Category, Product } from './data'
import { getDb } from './mongodb'

export type LeadInput = {
  name: string
  phone: string
  email?: string
  interest?: string
  budget?: string
  message?: string
  source?: string
  attribution?: {
    landingPath?: string
    referrer?: string
    sessionId?: string
    articleId?: string
    productId?: string
    utm?: {
      source?: string
      medium?: string
      campaign?: string
      term?: string
      content?: string
    }
  }
}

export async function createLead(input: LeadInput) {
  const db = await getDb()
  const lead = { ...input, status: 'new', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  const result = await db.collection('leads').insertOne(lead)
  return { ...lead, id: result.insertedId.toString() }
}

export async function listLeads() {
  const db = await getDb()
  return db.collection('leads').find({}).sort({ createdAt: -1 }).limit(500).toArray()
}

export async function updateLead(id: string, update: Partial<LeadInput> & { status?: string }) {
  const db = await getDb()
  const { ObjectId } = await import('mongodb')
  if (!ObjectId.isValid(id)) return null
  const result = await db.collection('leads').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  )
  return result
}

function compactProduct(product: Partial<Product> & Record<string, unknown>) {
  const now = new Date().toISOString()
  return {
    id: String(product.id || crypto.randomUUID()),
    name: String(product.name || '').trim(),
    slug: String(product.slug || '').trim(),
    category_id: String(product.category_id || ''),
    brand_id: String(product.brand_id || ''),
    category: String(product.category || ''),
    brand: String(product.brand || ''),
    price: Number(product.price) || 0,
    salePrice: product.salePrice === null || product.salePrice === undefined ? null : Number(product.salePrice),
    images: Array.isArray(product.images) ? product.images.map(String).slice(0, 12) : [],
    specifications: product.specifications && typeof product.specifications === 'object' ? product.specifications : {},
    description: String(product.description || ''),
    features: Array.isArray(product.features) ? product.features.map(String).slice(0, 30) : [],
    inStock: Boolean(product.inStock),
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    createdAt: String(product.createdAt || now),
    updatedAt: now,
  }
}

export async function createProduct(input: Partial<Product> & Record<string, unknown>) {
  const db = await getDb()
  const product = compactProduct(input)
  await db.collection('products').insertOne(product)
  return product
}

export async function updateProduct(id: string, input: Partial<Product> & Record<string, unknown>) {
  const db = await getDb()
  const current = await db.collection('products').findOne({ id })
  if (!current) return null
  const product = compactProduct({ ...current, ...input, id, createdAt: current.createdAt })
  await db.collection('products').replaceOne({ id }, product)
  return product
}

export async function deleteProduct(id: string) {
  const db = await getDb()
  const result = await db.collection('products').deleteOne({ id })
  return result.deletedCount > 0
}

export async function upsertCategory(input: Partial<Category>) {
  const db = await getDb()
  const category = {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || '').trim(),
    slug: String(input.slug || '').trim(),
    description: String(input.description || '').trim(),
    image: String(input.image || ''),
    sortOrder: Number(input.sortOrder) || 0,
  }
  await db.collection('categories').updateOne({ id: category.id }, { $set: category }, { upsert: true })
  return category
}

export async function deleteCategory(id: string) {
  const db = await getDb()
  const result = await db.collection('categories').deleteOne({ id })
  return result.deletedCount > 0
}

export async function upsertBrand(input: Partial<Brand>) {
  const db = await getDb()
  const brand = {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || '').trim(),
    slug: String(input.slug || '').trim(),
    description: String(input.description || '').trim(),
    logo: String(input.logo || ''),
    logoDark: String(input.logoDark || ''),
    logoLight: String(input.logoLight || ''),
    website: String(input.website || ''),
    country: String(input.country || ''),
    featured: Boolean((input as Brand & { featured?: boolean }).featured),
    sortOrder: Number(input.sortOrder) || 0,
  }
  await db.collection('brands').updateOne({ id: brand.id }, { $set: brand }, { upsert: true })
  return brand
}

export async function deleteBrand(id: string) {
  const db = await getDb()
  const result = await db.collection('brands').deleteOne({ id })
  return result.deletedCount > 0
}

export function serializeMongoDocument<T extends Record<string, unknown>>(document: T) {
  const { _id, ...rest } = document
  return { ...rest, id: rest.id || String(_id) }
}
