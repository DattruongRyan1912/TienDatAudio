import { slugify } from '@/lib/slug'
import { POST_STATUSES, type PostStatus } from '@/lib/content-types'
import { SOCIAL_MEDIA_TYPES, SOCIAL_POST_TYPES, type SocialAuthor, type SocialEngagementSnapshot, type SocialLinkPreview, type SocialMediaItem, type SocialPost, type SocialSEO } from './types'

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function text(value: unknown, fallback = '', maxLength = 1000) {
  return String(value ?? fallback).replace(/\r\n/g, '\n').trim().slice(0, maxLength)
}

function inlineText(value: unknown, fallback = '', maxLength = 1000) {
  return text(value, fallback, maxLength).replace(/\s+/g, ' ')
}

function list(value: unknown, maxItems = 50, maxLength = 200) {
  const source = Array.isArray(value) ? value : []
  return Array.from(new Set(source.map((item) => inlineText(item, '', maxLength)).filter(Boolean))).slice(0, maxItems)
}

function dateOrNull(value: unknown, fallback: string | null = null) {
  if (value === null || value === '') return null
  const candidate = inlineText(value, fallback || '', 40)
  const date = new Date(candidate)
  return candidate && Number.isFinite(date.getTime()) ? date.toISOString() : fallback
}

function safeUrl(value: unknown, fallback = '', allowedHosts?: string[]) {
  const candidate = inlineText(value, fallback, 2000)
  if (!candidate) return ''
  try {
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol)) return fallback
    if (allowedHosts && !allowedHosts.includes(parsed.hostname.toLowerCase())) return fallback
    return parsed.toString()
  } catch {
    return fallback
  }
}

function safeMediaUrl(value: unknown, type: SocialMediaItem['type']) {
  if (type === 'youtube') return safeUrl(value, '', ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'])
  if (type === 'facebook') return safeUrl(value, '', ['facebook.com', 'www.facebook.com', 'm.facebook.com'])
  return safeUrl(value, '')
}

function normalizeAuthor(value: unknown): SocialAuthor {
  const input = record(value)
  return {
    displayName: inlineText(input.displayName ?? input.name, 'Tiến Đạt Audio', 120),
    avatarUrl: safeUrl(input.avatarUrl ?? input.avatar, ''),
    verified: Boolean(input.verified),
  }
}

function normalizeMedia(value: unknown, index: number): SocialMediaItem | null {
  const input = record(value)
  const type = SOCIAL_MEDIA_TYPES.includes(input.type as typeof SOCIAL_MEDIA_TYPES[number]) ? input.type as SocialMediaItem['type'] : 'image'
  const url = safeMediaUrl(input.url, type)
  if (!url) return null
  const width = Number(input.width)
  const height = Number(input.height)
  const ratio = Number(input.aspectRatio)
  return {
    id: inlineText(input.id, `media-${index + 1}`, 100),
    type,
    url,
    thumbnailUrl: safeUrl(input.thumbnailUrl ?? input.thumbnail, url),
    publicId: inlineText(input.publicId, '', 300),
    width: Number.isFinite(width) && width > 0 ? width : null,
    height: Number.isFinite(height) && height > 0 ? height : null,
    aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : width > 0 && height > 0 ? width / height : null,
    alt: inlineText(input.alt, '', 300),
    order: Math.max(0, Number(input.order) || index),
  }
}

function normalizeLink(value: unknown): SocialLinkPreview | null {
  const input = record(value)
  const url = safeUrl(input.url, '')
  if (!url) return null
  const parsed = new URL(url)
  return {
    url,
    domain: parsed.hostname.replace(/^www\./, ''),
    title: inlineText(input.title, parsed.hostname, 180),
    description: inlineText(input.description, '', 400),
    imageUrl: safeUrl(input.imageUrl ?? input.image, ''),
  }
}

function normalizeEngagement(value: unknown): SocialEngagementSnapshot | undefined {
  const input = record(value)
  const source = input.source === 'facebook_sync' || input.source === 'manual_reference' ? input.source : 'none'
  if (source === 'none') return undefined
  return {
    source,
    capturedAt: dateOrNull(input.capturedAt, new Date().toISOString()) || new Date().toISOString(),
    ...(Number.isFinite(Number(input.likes)) ? { likes: Math.max(0, Number(input.likes)) } : {}),
    ...(Number.isFinite(Number(input.comments)) ? { comments: Math.max(0, Number(input.comments)) } : {}),
    ...(Number.isFinite(Number(input.shares)) ? { shares: Math.max(0, Number(input.shares)) } : {}),
  }
}

function normalizeSEO(value: unknown, slug: string): SocialSEO {
  const input = record(value)
  const canonical = inlineText(input.canonicalPath, `/bai-viet/${slug}`, 300)
  return {
    metaTitle: inlineText(input.metaTitle, '', 160),
    metaDescription: inlineText(input.metaDescription, '', 320),
    canonicalPath: canonical.startsWith('/') ? canonical : `/bai-viet/${slug}`,
    ogTitle: inlineText(input.ogTitle, '', 160),
    ogDescription: inlineText(input.ogDescription, '', 320),
    ogImage: safeUrl(input.ogImage, ''),
    noIndex: Boolean(input.noIndex),
  }
}

function deriveTitle(textValue: string) {
  const firstLine = textValue.split('\n').map((line) => line.replace(/^#+\s*/, '').trim()).find(Boolean) || ''
  return inlineText(firstLine.replace(/[#*_~`]/g, ''), 'Góc Audio', 180)
}

function normalizeStatus(input: UnknownRecord): PostStatus {
  return POST_STATUSES.includes(input.status as PostStatus) ? input.status as PostStatus : 'draft'
}

export function normalizeSocialPost(value: unknown): SocialPost {
  const input = record(value)
  const now = new Date().toISOString()
  const textValue = text(input.text ?? input.content, '', 200_000)
  const title = inlineText(input.title, deriveTitle(textValue), 180)
  const slug = slugify(inlineText(input.slug, title, 200))
  const media = (Array.isArray(input.media) ? input.media : []).map(normalizeMedia).filter((item): item is SocialMediaItem => Boolean(item)).sort((a, b) => a.order - b.order).slice(0, 50)
  const tags = list(input.tags, 50, 80)
  const mentions = list(input.mentions, 30, 120)
  const createdAt = dateOrNull(input.createdAt, now) || now
  const updatedAt = dateOrNull(input.updatedAt, createdAt) || createdAt
  const facebook = record(input.facebook || input.source)
  const postType = SOCIAL_POST_TYPES.includes(input.postType as typeof SOCIAL_POST_TYPES[number]) ? input.postType as SocialPost['postType'] : 'native'
  const excerpt = inlineText(input.excerpt, textValue.replace(/\s+/g, ' ').slice(0, 240), 500)
  const engagement = normalizeEngagement(input.engagement)

  return {
    id: inlineText(input.id, crypto.randomUUID(), 100),
    contentType: 'social',
    postType,
    title,
    slug,
    excerpt,
    text: textValue,
    category: inlineText(input.category, 'Góc Audio', 120),
    tags,
    mentions,
    author: normalizeAuthor(input.author),
    media,
    links: (Array.isArray(input.links) ? input.links : []).map(normalizeLink).filter((item): item is SocialLinkPreview => Boolean(item)).slice(0, 10),
    facebookSourceUrl: safeUrl(facebook.facebookSourceUrl ?? facebook.sourceUrl, '', ['facebook.com', 'www.facebook.com', 'm.facebook.com']),
    facebookEmbedUrl: safeUrl(facebook.facebookEmbedUrl ?? facebook.embedUrl, '', ['facebook.com', 'www.facebook.com', 'm.facebook.com']),
    relatedProductIds: list(input.relatedProductIds, 30, 100),
    relatedArticleIds: list(input.relatedArticleIds ?? input.relatedPostIds, 30, 100),
    relatedProjectIds: list(input.relatedProjectIds, 20, 100),
    ...(engagement ? { engagement } : {}),
    seo: normalizeSEO(input.seo, slug),
    status: normalizeStatus(input),
    scheduledAt: dateOrNull(input.scheduledAt),
    publishedAt: dateOrNull(input.publishedAt),
    archivedAt: dateOrNull(input.archivedAt),
    createdAt,
    updatedAt,
    version: Math.max(1, Number(input.version) || 1),
  }
}

export function validateSocialPost(value: unknown) {
  const post = normalizeSocialPost(value)
  const errors: string[] = []
  if (post.title.length < 2) errors.push('Bài viết cần tiêu đề')
  if (!post.slug) errors.push('Slug không hợp lệ')
  if (post.postType === 'native' && !post.text.trim() && post.media.length === 0) errors.push('Native post cần nội dung hoặc media')
  if (post.postType === 'facebook_embed' && !post.facebookEmbedUrl && !post.facebookSourceUrl) errors.push('Facebook Embed cần URL Facebook hợp lệ')
  if (post.media.some((item) => item.type === 'image' && !item.alt.trim())) errors.push('Mỗi hình ảnh public cần alt text')
  if (post.status === 'scheduled' && !post.scheduledAt) errors.push('Bài hẹn giờ phải có thời điểm xuất bản')
  if ((post.status === 'published' || post.status === 'scheduled') && post.excerpt.length < 12) errors.push('Bài public cần mô tả ngắn')
  return { post, errors }
}

export function hasPublicSocialStatus(post: SocialPost, now = new Date()) {
  if (post.status === 'published') return Boolean(post.publishedAt && new Date(post.publishedAt) <= now)
  return post.status === 'scheduled' && Boolean(post.scheduledAt && new Date(post.scheduledAt) <= now)
}
