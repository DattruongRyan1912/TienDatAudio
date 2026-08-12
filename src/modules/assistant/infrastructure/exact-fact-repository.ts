import { BUSINESS_PROFILE_KEY } from '@/lib/business-profile'
import { getDb, hasMongoConfig } from '@/lib/mongodb'
import type { AssistantBusinessProfile, AssistantProductFact } from '../domain/types'

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : ''
}

function stringList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => text(item, maxLength)).filter(Boolean))).slice(0, maxItems)
}

function googleMapsUrl(value: unknown) {
  const candidate = text(value, 2000)
  try {
    const parsed = new URL(candidate)
    const allowedHost = parsed.hostname === 'google.com'
      || parsed.hostname.endsWith('.google.com')
      || parsed.hostname === 'maps.app.goo.gl'
    return parsed.protocol === 'https:' && allowedHost ? parsed.toString() : ''
  } catch {
    return ''
  }
}

function timestamp(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  const candidate = text(value, 80)
  const parsed = candidate ? new Date(candidate) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : ''
}

function requireMongo() {
  if (!hasMongoConfig()) throw new Error('ASSISTANT_LIVE_DATA_UNAVAILABLE')
}

export async function loadAssistantBusinessProfile(): Promise<AssistantBusinessProfile> {
  requireMongo()
  const db = await getDb()
  const document = await db.collection('site_settings').findOne({ key: BUSINESS_PROFILE_KEY })
  const value = record(document?.value)
  if (!document || !Object.keys(value).length) throw new Error('ASSISTANT_LIVE_DATA_UNAVAILABLE')

  const address = record(value.address)
  const rawPhone = text(value.phone, 40).replace(/\s+/g, '')
  const phone = /^0[0-9]{9,10}$/.test(rawPhone) ? rawPhone : ''
  const emailCandidate = text(value.email, 160).toLowerCase()
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCandidate) ? emailCandidate : ''

  return {
    ...(text(value.name, 120) ? { name: text(value.name, 120) } : {}),
    ...(text(value.alternateName, 120) ? { alternateName: text(value.alternateName, 120) } : {}),
    ...(text(value.description, 700) ? { description: text(value.description, 700) } : {}),
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    ...(text(address.formatted, 300) ? { address: text(address.formatted, 300) } : {}),
    businessHours: stringList(value.businessHours, 14, 120),
    ...(googleMapsUrl(value.mapUrl) ? { mapUrl: googleMapsUrl(value.mapUrl) } : {}),
    ...(timestamp(value.updatedAt || document.updatedAt) ? { updatedAt: timestamp(value.updatedAt || document.updatedAt) } : {}),
  }
}

function productSpecifications(value: unknown) {
  const source = record(value)
  return Object.fromEntries(
    Object.entries(source)
      .slice(0, 50)
      .map(([key, item]) => {
        const safeKey = text(key, 120)
        const safeValue = Array.isArray(item)
          ? stringList(item, 30, 300)
          : text(item, 500)
        return [safeKey, safeValue] as const
      })
      .filter(([key, item]) => key && (Array.isArray(item) ? item.length : item)),
  )
}

function numberOrNull(value: unknown) {
  const candidate = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN
  return Number.isFinite(candidate) && candidate >= 0 ? candidate : null
}

export async function listAssistantProducts(): Promise<AssistantProductFact[]> {
  requireMongo()
  const db = await getDb()
  const documents = await db.collection('products').find({}).sort({ featured: -1, createdAt: -1 }).limit(500).toArray()

  return documents
    .map((document) => ({
      id: text(document.id, 160) || String(document._id),
      name: text(document.name, 240),
      slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(document.slug, 240)) ? text(document.slug, 240) : '',
      ...(text(document.brand, 160) ? { brand: text(document.brand, 160) } : {}),
      ...(text(document.brand_id, 160) ? { brandId: text(document.brand_id, 160) } : {}),
      ...(text(document.category, 160) ? { category: text(document.category, 160) } : {}),
      ...(text(document.category_id, 160) ? { categoryId: text(document.category_id, 160) } : {}),
      price: numberOrNull(document.price),
      salePrice: numberOrNull(document.salePrice),
      inStock: typeof document.inStock === 'boolean' ? document.inStock : null,
      specifications: productSpecifications(document.specifications),
      ...(text(document.description, 2000) ? { description: text(document.description, 2000) } : {}),
      ...(stringList(document.features, 30, 300).length ? { features: stringList(document.features, 30, 300) } : {}),
      ...(stringList(document.images, 20, 2000)[0] ? { imageUrl: stringList(document.images, 20, 2000)[0] } : {}),
      ...(timestamp(document.updatedAt) ? { updatedAt: timestamp(document.updatedAt) } : {}),
    }))
    .filter((product) => product.id && product.name && product.slug)
}
