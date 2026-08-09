import fs from 'node:fs'
import path from 'node:path'
import fallbackStrategy from '../../data/seo-strategy.json'
import { getDb, hasMongoConfig } from './mongodb'
import type { AIOConfig, SEOConfig, SEOEntityProfile, SEOFAQ, SEOKeyword, SEOKeywordIntent, SEOKeywordPriority } from './seo-types'

const SEO_STRATEGY_KEY = 'seo_strategy'
const SEO_STRATEGY_FILE = path.join(process.cwd(), 'data', 'seo-strategy.json')
const keywordIntents: SEOKeywordIntent[] = ['transactional', 'commercial', 'informational', 'local', 'navigational']
const keywordPriorities: SEOKeywordPriority[] = ['high', 'medium', 'low']

type UnknownRecord = Record<string, unknown>

function cleanText(value: unknown, fallback = '', maxLength = 1000) {
  return String(value ?? fallback).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function cleanList(value: unknown, fallback: string[] = [], maxItems = 50, maxLength = 300) {
  const source = Array.isArray(value) ? value : fallback
  return source.map((item) => cleanText(item, '', maxLength)).filter(Boolean).slice(0, maxItems)
}

function cleanUrl(value: unknown, fallback = '') {
  const url = cleanText(value, fallback, 500)
  return url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/') ? url : fallback
}

function normalizeEntity(value: unknown): SEOEntityProfile {
  const input = value && typeof value === 'object' ? value as UnknownRecord : {}
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)
  return {
    name: cleanText(input.name, 'Tiến Đạt Audio', 120),
    alternateName: cleanText(input.alternateName, '', 120),
    description: cleanText(input.description, '', 500),
    url: cleanUrl(input.url, 'https://tiendataudioquangngai.id.vn').replace(/\/$/, ''),
    logo: cleanUrl(input.logo, '/images/logo.png'),
    phone: cleanText(input.phone, '', 40),
    email: cleanText(input.email, '', 160),
    address: cleanText(input.address, '', 300),
    areaServed: cleanList(input.areaServed, [], 20, 120),
    ...(Number.isFinite(latitude) ? { latitude } : {}),
    ...(Number.isFinite(longitude) ? { longitude } : {}),
    sameAs: cleanList(input.sameAs, [], 20, 500).filter((url) => url.startsWith('https://') || url.startsWith('http://')),
  }
}

function normalizeKeyword(value: unknown, index: number): SEOKeyword | null {
  const input = typeof value === 'string' ? { term: value } : value && typeof value === 'object' ? value as UnknownRecord : {}
  const term = cleanText(input.term, '', 160)
  if (!term) return null
  const intent = keywordIntents.includes(input.intent as SEOKeywordIntent) ? input.intent as SEOKeywordIntent : 'informational'
  const priority = keywordPriorities.includes(input.priority as SEOKeywordPriority) ? input.priority as SEOKeywordPriority : 'medium'
  return {
    id: cleanText(input.id, `keyword-${index + 1}`, 100),
    term,
    intent,
    targetPage: cleanText(input.targetPage, '/', 200),
    cluster: cleanText(input.cluster, 'general', 100),
    priority,
    notes: cleanText(input.notes, '', 500),
    isActive: input.isActive !== false,
    updatedAt: cleanText(input.updatedAt, new Date().toISOString(), 40),
  }
}

function normalizeFAQ(value: unknown, index: number): SEOFAQ | null {
  const input = value && typeof value === 'object' ? value as UnknownRecord : {}
  const question = cleanText(input.question, '', 300)
  const answer = cleanText(input.answer, '', 1000)
  if (!question || !answer) return null
  return { id: cleanText(input.id, `faq-${index + 1}`, 100), question, answer }
}

function normalizeAI(value: unknown): AIOConfig {
  const input = value && typeof value === 'object' ? value as UnknownRecord : {}
  const faqs = (Array.isArray(input.faqs) ? input.faqs : [])
    .map(normalizeFAQ)
    .filter((faq): faq is SEOFAQ => Boolean(faq))
    .slice(0, 30)
  return {
    enabled: input.enabled !== false,
    positioning: cleanText(input.positioning, '', 700),
    entityFacts: cleanList(input.entityFacts, [], 30, 500),
    services: cleanList(input.services, [], 30, 180),
    answerGuidelines: cleanList(input.answerGuidelines, [], 20, 500),
    faqs,
    preferredSources: cleanList(input.preferredSources, ['/', '/products', '/contact'], 30, 200),
  }
}

export function normalizeSEOConfig(value: unknown): SEOConfig {
  const input = value && typeof value === 'object' ? value as UnknownRecord : {}
  const keywords = (Array.isArray(input.keywords) ? input.keywords : [])
    .map(normalizeKeyword)
    .filter((keyword): keyword is SEOKeyword => Boolean(keyword))
    .slice(0, 200)
  return {
    id: cleanText(input.id, SEO_STRATEGY_KEY, 100),
    entity: normalizeEntity(input.entity),
    keywords,
    ai: normalizeAI(input.ai),
    updatedAt: cleanText(input.updatedAt, new Date().toISOString(), 40),
  }
}

const defaultSEOConfig = normalizeSEOConfig(fallbackStrategy)

export async function getSEOConfig(): Promise<SEOConfig> {
  if (!hasMongoConfig()) return defaultSEOConfig
  try {
    const db = await getDb()
    const record = await db.collection('site_settings').findOne({ key: SEO_STRATEGY_KEY })
    return record?.value ? normalizeSEOConfig(record.value) : defaultSEOConfig
  } catch (error) {
    console.error('[seo-strategy] MongoDB unavailable, using JSON fallback:', error)
    return defaultSEOConfig
  }
}

export async function saveSEOConfig(value: unknown): Promise<SEOConfig> {
  const config = normalizeSEOConfig(value)
  const updatedAt = new Date().toISOString()
  const nextConfig = { ...config, updatedAt }

  if (!hasMongoConfig()) {
    fs.writeFileSync(SEO_STRATEGY_FILE, JSON.stringify(nextConfig, null, 2), 'utf8')
    return nextConfig
  }

  const db = await getDb()
  await db.collection('site_settings').updateOne(
    { key: SEO_STRATEGY_KEY },
    { $set: { key: SEO_STRATEGY_KEY, value: nextConfig, updatedAt } },
    { upsert: true },
  )
  return nextConfig
}

function absoluteUrl(value: string, baseUrl: string) {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`
}

export function buildAIReadableStructuredData(config: SEOConfig) {
  const { entity, keywords, ai } = config
  const baseUrl = entity.url.replace(/\/$/, '')
  const businessId = `${baseUrl}#business`
  const discoveryKeywords = ai.enabled ? keywords.filter((keyword) => keyword.isActive) : []
  const discoveryServices = ai.enabled ? ai.services : []
  const topics = Array.from(new Set([
    ...discoveryKeywords.map((keyword) => keyword.term),
    ...discoveryServices,
  ])).slice(0, 30)
  const address = {
    '@type': 'PostalAddress',
    streetAddress: entity.address,
    addressLocality: 'Quảng Ngãi',
    addressRegion: 'Quảng Ngãi',
    addressCountry: 'VN',
  }
  const business: UnknownRecord = {
    '@type': 'Store',
    '@id': businessId,
    name: entity.name,
    alternateName: entity.alternateName || undefined,
    url: baseUrl,
    logo: absoluteUrl(entity.logo, baseUrl),
    image: absoluteUrl(entity.logo, baseUrl),
    description: entity.description,
    telephone: entity.phone || undefined,
    email: entity.email || undefined,
    address,
    areaServed: entity.areaServed,
    sameAs: entity.sameAs,
    ...(topics.length > 0 ? { knowsAbout: topics } : {}),
  }

  if (entity.latitude !== undefined && entity.longitude !== undefined) {
    business.geo = {
      '@type': 'GeoCoordinates',
      latitude: entity.latitude,
      longitude: entity.longitude,
    }
  }

  if (discoveryServices.length > 0) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `Dịch vụ ${entity.name}`,
      itemListElement: discoveryServices.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: service,
          provider: { '@id': businessId },
        },
      })),
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        name: entity.name,
        url: baseUrl,
        description: entity.description,
        publisher: { '@id': businessId },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/products?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

export function buildLLMSText(config: SEOConfig) {
  const { entity, keywords, ai } = config
  const baseUrl = entity.url.replace(/\/$/, '')
  const linkFor = (pathOrUrl: string) => absoluteUrl(pathOrUrl, baseUrl)
  const activeKeywords = ai.enabled ? keywords.filter((keyword) => keyword.isActive) : []
  const aiSections = ai.enabled ? [
    '## Positioning',
    ai.positioning,
    '',
    '## Services',
    ...ai.services.map((service) => `- ${service}`),
    '',
    '## Entity facts',
    ...ai.entityFacts.map((fact) => `- ${fact}`),
    '',
    '## Questions this business answers',
    ...ai.faqs.flatMap((faq) => [`### ${faq.question}`, faq.answer, '']),
  ] : ['## AI discovery signals', '- Disabled in admin.']
  const lines = [
    `# ${entity.name}`,
    `> ${entity.description}`,
    '',
    '## Canonical identity',
    `- Website: ${baseUrl}`,
    `- Address: ${entity.address}`,
    `- Areas served: ${entity.areaServed.join(', ')}`,
    `- Phone: ${entity.phone}`,
    `- Email: ${entity.email}`,
    '',
    '## Topics and search intents',
    ...activeKeywords.map((keyword) => `- ${keyword.term} | intent=${keyword.intent} | page=${linkFor(keyword.targetPage)} | cluster=${keyword.cluster}`),
    '',
    ...aiSections,
    '',
    '## Preferred source pages',
    ...(ai.enabled ? ai.preferredSources.map((source) => `- ${linkFor(source)}`) : []),
    '',
    ...(ai.enabled ? ['## Answer guidance', ...ai.answerGuidelines.map((guideline) => `- ${guideline}`)] : []),
    '',
    `Last updated: ${config.updatedAt}`,
  ]
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
}
