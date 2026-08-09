import fallbackProfile from '../../data/business-profile.json'
import { getDb, hasMongoConfig } from './mongodb'

export const BUSINESS_PROFILE_KEY = 'business_profile'

export interface BusinessAddress {
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
  formatted: string
}

export interface BusinessProfile {
  name: string
  alternateName: string
  description: string
  siteUrl: string
  logo: string
  phone: string
  email: string
  address: BusinessAddress
  businessHours: string[]
  latitude?: number
  longitude?: number
  areaServed: string[]
  services: string[]
  socialLinks: string[]
  mapEmbedUrl: string
  mapUrl: string
  updatedAt: string
}

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function text(value: unknown, fallback = '', maxLength = 1000) {
  return String(value ?? fallback).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function list(value: unknown, fallback: string[] = [], maxItems = 50, maxLength = 300) {
  const source = Array.isArray(value) ? value : fallback
  return Array.from(new Set(source.map((item) => text(item, '', maxLength)).filter(Boolean))).slice(0, maxItems)
}

function url(value: unknown, fallback = '', allowRelative = false) {
  const candidate = text(value, fallback, 2000)
  if (allowRelative && candidate.startsWith('/')) return candidate
  if (candidate.startsWith('https://') || candidate.startsWith('http://')) return candidate
  return fallback
}

export function normalizeBusinessProfile(value: unknown): BusinessProfile {
  const defaults = fallbackProfile as BusinessProfile
  const input = record(value)
  const addressInput = record(input.address)
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)

  return {
    name: text(input.name, defaults.name, 120),
    alternateName: text(input.alternateName, defaults.alternateName, 120),
    description: text(input.description, defaults.description, 700),
    siteUrl: url(input.siteUrl, defaults.siteUrl).replace(/\/$/, ''),
    logo: url(input.logo, defaults.logo, true),
    phone: text(input.phone, defaults.phone, 40),
    email: text(input.email, defaults.email, 160).toLowerCase(),
    address: {
      streetAddress: text(addressInput.streetAddress, defaults.address.streetAddress, 200),
      addressLocality: text(addressInput.addressLocality, defaults.address.addressLocality, 100),
      addressRegion: text(addressInput.addressRegion, defaults.address.addressRegion, 100),
      postalCode: text(addressInput.postalCode, defaults.address.postalCode, 20),
      addressCountry: text(addressInput.addressCountry, defaults.address.addressCountry, 2).toUpperCase(),
      formatted: text(addressInput.formatted, defaults.address.formatted, 300),
    },
    businessHours: list(input.businessHours, defaults.businessHours, 14, 120),
    ...(Number.isFinite(latitude) ? { latitude } : {}),
    ...(Number.isFinite(longitude) ? { longitude } : {}),
    areaServed: list(input.areaServed, defaults.areaServed, 30, 120),
    services: list(input.services, defaults.services, 30, 180),
    socialLinks: list(input.socialLinks, defaults.socialLinks, 20, 500)
      .filter((item) => item.startsWith('https://') || item.startsWith('http://')),
    mapEmbedUrl: url(input.mapEmbedUrl, defaults.mapEmbedUrl),
    mapUrl: url(input.mapUrl, defaults.mapUrl),
    updatedAt: text(input.updatedAt, defaults.updatedAt, 40),
  }
}

export function validateBusinessProfile(value: unknown) {
  const profile = normalizeBusinessProfile(value)
  const errors: string[] = []
  if (profile.name.length < 2) errors.push('Tên doanh nghiệp là bắt buộc')
  if (!/^0[0-9]{9,10}$/.test(profile.phone.replace(/\s/g, ''))) errors.push('Số điện thoại không hợp lệ')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.push('Email không hợp lệ')
  if (!profile.address.formatted) errors.push('Địa chỉ hiển thị là bắt buộc')
  if (!profile.siteUrl.startsWith('https://')) errors.push('Website canonical phải dùng HTTPS')
  if (profile.latitude !== undefined && (profile.latitude < -90 || profile.latitude > 90)) errors.push('Vĩ độ không hợp lệ')
  if (profile.longitude !== undefined && (profile.longitude < -180 || profile.longitude > 180)) errors.push('Kinh độ không hợp lệ')
  return { profile, errors }
}

const defaultProfile = normalizeBusinessProfile(fallbackProfile)

export async function getBusinessProfile(): Promise<BusinessProfile> {
  if (!hasMongoConfig()) return defaultProfile
  try {
    const db = await getDb()
    const record = await db.collection('site_settings').findOne({ key: BUSINESS_PROFILE_KEY })
    return normalizeBusinessProfile(record?.value || defaultProfile)
  } catch (error) {
    console.error('[business-profile] MongoDB unavailable, using JSON fallback:', error)
    return defaultProfile
  }
}

export async function saveBusinessProfile(value: unknown): Promise<BusinessProfile> {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
  const { profile, errors } = validateBusinessProfile(value)
  if (errors.length) throw new Error(`VALIDATION:${errors.join('|')}`)
  const updatedAt = new Date().toISOString()
  const nextProfile = { ...profile, updatedAt }
  const db = await getDb()
  await db.collection('site_settings').updateOne(
    { key: BUSINESS_PROFILE_KEY },
    { $set: { key: BUSINESS_PROFILE_KEY, value: nextProfile, updatedAt } },
    { upsert: true },
  )
  return nextProfile
}

export function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : phone
}
