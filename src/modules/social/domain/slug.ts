import { slugify } from '@/lib/slug'

const MAX_SOCIAL_SLUG_LENGTH = 200

function isFacebookHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^www\./, '')
  return normalized === 'facebook.com' || normalized === 'm.facebook.com' || normalized.endsWith('.facebook.com')
}

function canonicalSourceUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''
    url.searchParams.sort()
    return url.toString()
  } catch {
    return value.trim()
  }
}

function stableHash(value: string) {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return (hash >>> 0).toString(36).padStart(7, '0')
}

/**
 * Returns a Facebook post identity without using the account/page id as the
 * post identity. If Facebook exposes no stable numeric id, the source URL is
 * reduced to a deterministic short hash instead.
 */
export function extractFacebookPostIdentity(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl)
    if (!isFacebookHostname(url.hostname)) return ''

    for (const key of ['story_fbid', 'fbid', 'post_id']) {
      const value = url.searchParams.get(key)?.trim() || ''
      if (/^\d+$/.test(value)) return value
    }

    const pathMatch = url.pathname.match(/\/(?:posts|post|reel|reels|videos?|photos?|permalink)\/(\d+)/i)
    return pathMatch?.[1] || ''
  } catch {
    return ''
  }
}

function sourceIdentity(sourceUrl: string) {
  const canonical = canonicalSourceUrl(sourceUrl)
  if (!canonical) return ''
  const facebookId = extractFacebookPostIdentity(canonical)
  return facebookId || `src-${stableHash(canonical)}`
}

/**
 * Builds a readable slug that remains stable for the same imported source.
 * Manual posts without a source keep the existing title-only slug behavior.
 */
export function buildSocialPostSlug(title: string, sourceUrl = '') {
  const base = slugify(title) || 'goc-audio'
  const identity = sourceIdentity(sourceUrl)
  if (!identity) return base

  const maxBaseLength = MAX_SOCIAL_SLUG_LENGTH - identity.length - 1
  const shortenedBase = base.slice(0, Math.max(1, maxBaseLength)).replace(/-+$/g, '') || 'goc-audio'
  return `${shortenedBase}-${identity}`
}

/**
 * Keeps an intentionally edited slug, but upgrades slugs that were only
 * auto-generated from a title when a source link is imported.
 */
export function buildImportedSocialSlug(currentSlug: string, currentTitle: string, importedTitle: string, sourceUrl: string) {
  const trimmedSlug = currentSlug.trim()
  if (!trimmedSlug || slugify(trimmedSlug) === slugify(currentTitle) || slugify(trimmedSlug) === slugify(importedTitle)) {
    return buildSocialPostSlug(importedTitle || currentTitle, sourceUrl)
  }
  return trimmedSlug
}
