export type SocialLinkImportKind = 'facebook' | 'public_link'

export interface SocialLinkImportPreview {
  sourceUrl: string
  resolvedUrl: string
  kind: SocialLinkImportKind
  domain: string
  title: string
  description: string
  imageUrl: string
  facebookEmbedUrl: string
  warning: string
}

export interface SocialLinkImportedAsset {
  url: string
  publicId: string
  width: number | null
  height: number | null
  bytes: number
  format: string
  alt?: string
  sourcePhotoUrl?: string
}

export interface SocialGalleryImage {
  imageUrl: string
  photoUrl: string
  label: string
}

export type SocialGalleryProvider = 'graph_api' | 'public_browser' | 'manual_profile' | 'cdp_browser' | 'browser_extension'
export type SocialGallerySessionSource = 'none' | 'local_storage_state' | 'manual_login' | 'cdp_browser' | 'browser_session'

export interface SocialGalleryScanResult {
  images: SocialGalleryImage[]
  finalUrl: string
  loginRequired: boolean
  partialGallery: boolean
  provider?: SocialGalleryProvider
  sessionSource?: SocialGallerySessionSource
  warning?: string
}

const MAX_URL_LENGTH = 2_048

function isPrivateIpv4(value: string) {
  const parts = value.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false
  const [first, second] = parts
  return first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || first >= 224
}

function isPrivateIpv6(value: string) {
  const normalized = value.toLowerCase().split('%')[0]
  if (normalized.startsWith('::ffff:')) return isPrivateIpv4(normalized.slice(7))
  return normalized === '::'
    || normalized === '::1'
    || normalized.startsWith('fc')
    || normalized.startsWith('fd')
    || normalized.startsWith('fe8')
    || normalized.startsWith('fe9')
    || normalized.startsWith('fea')
    || normalized.startsWith('feb')
}

export function isBlockedIpAddress(value: string) {
  const normalized = value.replace(/^\[|\]$/g, '')
  if (/^\d+\.\d+\.\d+\.\d+$/.test(normalized)) return isPrivateIpv4(normalized)
  if (normalized.includes(':')) return isPrivateIpv6(normalized)
  return false
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, '')
  return normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized.endsWith('.local')
    || normalized.endsWith('.internal')
    || normalized.endsWith('.home.arpa')
}

export function normalizePublicLinkUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('PUBLIC_URL_REQUIRED')
  const candidate = value.trim()
  if (candidate.length > MAX_URL_LENGTH) throw new Error('PUBLIC_URL_INVALID')

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('PUBLIC_URL_INVALID')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)
    || parsed.username
    || parsed.password
    || !parsed.hostname
    || (parsed.port && !['80', '443'].includes(parsed.port))
    || isBlockedHostname(parsed.hostname)
    || isBlockedIpAddress(parsed.hostname)) {
    throw new Error('PUBLIC_URL_INVALID')
  }

  return parsed.toString()
}

export function isFacebookLink(value: string) {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  return hostname === 'facebook.com' || hostname === 'm.facebook.com' || hostname === 'fb.watch' || hostname.endsWith('.facebook.com')
}

export function isFacebookMediaLink(value: string) {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  return hostname.endsWith('.fbcdn.net') || hostname.endsWith('.fbsbx.com') || hostname === 'facebook.com' || hostname.endsWith('.facebook.com')
}

export function createFacebookEmbedUrl(sourceUrl: string) {
  return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(sourceUrl)}&show_text=true&width=500`
}

function decodeHtml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  }
  return value
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, name: string) => {
      if (name.startsWith('#x')) return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
      if (name.startsWith('#')) return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
      return namedEntities[name.toLowerCase()] || entity
    })
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function limitedText(value: string, maxLength: number) {
  return decodeHtml(value).slice(0, maxLength)
}

function readAttributes(tag: string) {
  const attributes: Record<string, string> = {}
  const attributePattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  for (const match of tag.matchAll(attributePattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attributes
}

export function parseOpenGraphMetadata(html: string) {
  const metadata: Record<string, string> = {}
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = readAttributes(tag)
    const key = (attributes.property || attributes.name || '').toLowerCase()
    const content = attributes.content || ''
    if (key && content && !metadata[key]) metadata[key] = limitedText(content, 2_000)
  }

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return {
    title: limitedText(metadata['og:title'] || metadata['twitter:title'] || titleMatch?.[1] || '', 180),
    description: limitedText(metadata['og:description'] || metadata.description || metadata['twitter:description'] || '', 400),
    image: metadata['og:image'] || metadata['twitter:image'] || '',
  }
}

function resolveImageUrl(value: string, sourceUrl: string) {
  if (!value) return ''
  try {
    return normalizePublicLinkUrl(new URL(value, sourceUrl).toString())
  } catch {
    return ''
  }
}

export function buildPublicLinkImportPreview({ sourceUrl, resolvedUrl, html = '', warning = '' }: { sourceUrl: string; resolvedUrl?: string; html?: string; warning?: string }): SocialLinkImportPreview {
  const normalizedSourceUrl = normalizePublicLinkUrl(sourceUrl)
  const normalizedResolvedUrl = resolvedUrl ? normalizePublicLinkUrl(resolvedUrl) : normalizedSourceUrl
  const metadata = parseOpenGraphMetadata(html)
  const kind = isFacebookLink(normalizedSourceUrl) || isFacebookLink(normalizedResolvedUrl) ? 'facebook' : 'public_link'
  const domain = new URL(normalizedResolvedUrl).hostname.replace(/^www\./, '')
  const fallbackTitle = kind === 'facebook' ? 'Bài viết Facebook công khai' : `Liên kết public — ${domain}`

  return {
    sourceUrl: normalizedSourceUrl,
    resolvedUrl: normalizedResolvedUrl,
    kind,
    domain,
    title: metadata.title || fallbackTitle,
    description: metadata.description,
    imageUrl: resolveImageUrl(metadata.image, normalizedResolvedUrl),
    facebookEmbedUrl: kind === 'facebook' ? createFacebookEmbedUrl(normalizedSourceUrl) : '',
    warning,
  }
}
