import fallbackStrategy from '../../data/seo-strategy.json'
import type { BusinessProfile } from './business-profile'
import type { ContentPost } from './content-types'
import { getDb, hasMongoConfig } from './mongodb'
import type { AIOConfig, SEOConfig, SEOFAQ, SEOKeyword, SEOKeywordIntent, SEOKeywordPriority } from './seo-types'

const SEO_STRATEGY_KEY = 'seo_strategy'
const keywordIntents: SEOKeywordIntent[] = ['transactional', 'commercial', 'informational', 'local', 'navigational']
const keywordPriorities: SEOKeywordPriority[] = ['high', 'medium', 'low']

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function cleanText(value: unknown, fallback = '', maxLength = 1000) {
  return String(value ?? fallback).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function cleanList(value: unknown, fallback: string[] = [], maxItems = 50, maxLength = 300) {
  const source = Array.isArray(value) ? value : fallback
  return Array.from(new Set(source.map((item) => cleanText(item, '', maxLength)).filter(Boolean))).slice(0, maxItems)
}

function normalizeKeyword(value: unknown, index: number): SEOKeyword | null {
  const input = typeof value === 'string' ? { term: value } : record(value)
  const term = cleanText(input.term, '', 160)
  if (!term) return null
  const brief = record(input.brief)
  const intent = keywordIntents.includes(input.intent as SEOKeywordIntent) ? input.intent as SEOKeywordIntent : 'informational'
  const priority = keywordPriorities.includes(input.priority as SEOKeywordPriority) ? input.priority as SEOKeywordPriority : 'medium'
  return {
    id: cleanText(input.id, `keyword-${index + 1}`, 100),
    term,
    intent,
    targetPage: cleanText(input.targetPage, '/', 200),
    cluster: cleanText(input.cluster, 'general', 100),
    priority,
    notes: cleanText(input.notes, '', 1000),
    ...(Object.keys(brief).length ? { brief: {
      audience: cleanText(brief.audience, '', 300),
      angle: cleanText(brief.angle, '', 500),
      questions: cleanList(brief.questions, [], 20, 300),
      secondaryTerms: cleanList(brief.secondaryTerms, [], 30, 160),
      callToAction: cleanText(brief.callToAction, '', 300),
    } } : {}),
    isActive: input.isActive !== false,
    updatedAt: cleanText(input.updatedAt, new Date().toISOString(), 40),
  }
}

function normalizeFAQ(value: unknown, index: number): SEOFAQ | null {
  const input = record(value)
  const question = cleanText(input.question, '', 300)
  const answer = cleanText(input.answer, '', 2000)
  if (!question || !answer) return null
  return { id: cleanText(input.id, `faq-${index + 1}`, 100), question, answer }
}

function normalizeAI(value: unknown): AIOConfig {
  const input = record(value)
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
    preferredSources: cleanList(input.preferredSources, ['/', '/products', '/kien-thuc', '/contact', '/faq'], 50, 300),
  }
}

export function normalizeSEOConfig(value: unknown): SEOConfig {
  const input = record(value)
  const keywords = (Array.isArray(input.keywords) ? input.keywords : [])
    .map(normalizeKeyword)
    .filter((keyword): keyword is SEOKeyword => Boolean(keyword))
    .slice(0, 500)
  return {
    id: cleanText(input.id, SEO_STRATEGY_KEY, 100),
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
    const stored = await db.collection('site_settings').findOne({ key: SEO_STRATEGY_KEY })
    return stored?.value ? normalizeSEOConfig(stored.value) : defaultSEOConfig
  } catch (error) {
    console.error('[seo-strategy] MongoDB unavailable, using JSON fallback:', error)
    return defaultSEOConfig
  }
}

export async function saveSEOConfig(value: unknown): Promise<SEOConfig> {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
  const config = normalizeSEOConfig(value)
  const updatedAt = new Date().toISOString()
  const nextConfig = { ...config, updatedAt }
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

export function buildAIReadableStructuredData(config: SEOConfig, profile: BusinessProfile) {
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const businessId = `${baseUrl}#business`
  const activeKeywords = config.ai.enabled ? config.keywords.filter((keyword) => keyword.isActive) : []
  const services = Array.from(new Set([...profile.services, ...(config.ai.enabled ? config.ai.services : [])]))
  const topics = Array.from(new Set([...activeKeywords.map((keyword) => keyword.term), ...services])).slice(0, 50)
  const business: UnknownRecord = {
    '@type': ['Store', 'LocalBusiness'],
    '@id': businessId,
    name: profile.name,
    alternateName: profile.alternateName || undefined,
    url: baseUrl,
    logo: absoluteUrl(profile.logo, baseUrl),
    image: absoluteUrl(profile.logo, baseUrl),
    description: profile.description,
    telephone: profile.phone,
    email: profile.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile.address.streetAddress,
      addressLocality: profile.address.addressLocality,
      addressRegion: profile.address.addressRegion,
      postalCode: profile.address.postalCode || undefined,
      addressCountry: profile.address.addressCountry,
    },
    openingHours: profile.businessHours,
    areaServed: profile.areaServed,
    sameAs: profile.socialLinks,
    knowsAbout: topics,
    hasMap: profile.mapUrl,
  }
  if (profile.latitude !== undefined && profile.longitude !== undefined) {
    business.geo = { '@type': 'GeoCoordinates', latitude: profile.latitude, longitude: profile.longitude }
  }
  if (services.length) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `Dịch vụ ${profile.name}`,
      itemListElement: services.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: { '@type': 'Service', name: service, provider: { '@id': businessId } },
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
        name: profile.name,
        url: baseUrl,
        description: profile.description,
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

export function buildLLMSText(config: SEOConfig, profile: BusinessProfile, posts: ContentPost[] = []) {
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const linkFor = (pathOrUrl: string) => absoluteUrl(pathOrUrl, baseUrl)
  const activeKeywords = config.ai.enabled ? config.keywords.filter((keyword) => keyword.isActive) : []
  const services = Array.from(new Set([...profile.services, ...(config.ai.enabled ? config.ai.services : [])]))
  const publishedFAQs = posts.flatMap((post) => post.faqs.map((faq) => ({ ...faq, post })))
  const publicSources = Array.from(new Set([
    ...(config.ai.enabled ? config.ai.preferredSources : []),
    ...posts.map((post) => `/kien-thuc/${post.slug}`),
  ]))
  const lines = [
    `# ${profile.name}`,
    `> ${profile.description}`,
    '',
    '## Canonical identity',
    `- Website: ${baseUrl}`,
    `- Address: ${profile.address.formatted}`,
    `- Areas served: ${profile.areaServed.join(', ')}`,
    `- Phone: ${profile.phone}`,
    `- Email: ${profile.email}`,
    `- Business hours: ${profile.businessHours.join('; ')}`,
    '',
    '## Services',
    ...services.map((service) => `- ${service}`),
    '',
    '## Topics and search intents',
    ...activeKeywords.map((keyword) => `- ${keyword.term} | intent=${keyword.intent} | page=${linkFor(keyword.targetPage)} | cluster=${keyword.cluster}`),
    '',
    '## Published knowledge',
    ...posts.flatMap((post) => [`### ${post.title}`, `${post.excerpt} Source: ${linkFor(`/kien-thuc/${post.slug}`)}`, '']),
    ...(config.ai.enabled ? [
      '## Positioning',
      config.ai.positioning,
      '',
      '## Verified business facts',
      ...config.ai.entityFacts.map((fact) => `- ${fact}`),
      '',
      '## Public questions and answers',
      ...config.ai.faqs.flatMap((faq) => [`### ${faq.question}`, `${faq.answer} Source: ${linkFor('/faq')}`, '']),
      ...publishedFAQs.flatMap(({ post, ...faq }) => [`### ${faq.question}`, `${faq.answer} Source: ${linkFor(`/kien-thuc/${post.slug}`)}`, '']),
      '## Preferred source pages',
      ...publicSources.map((source) => `- ${linkFor(source)}`),
      '',
      '## Answer guidance',
      ...config.ai.answerGuidelines.map((guideline) => `- ${guideline}`),
    ] : ['## AI discovery signals', '- Disabled in admin.']),
    '',
    `Last updated: ${[config.updatedAt, profile.updatedAt, ...posts.map((post) => post.updatedAt)].sort().at(-1)}`,
  ]
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
}
