import {
  isFacebookLink,
  isFacebookMediaLink,
  normalizePublicLinkUrl,
  type SocialGalleryImage,
  type SocialGalleryScanResult,
} from '../domain/link-preview'
import { normalizeSocialSourceText } from '../domain/source-content'

const BRIDGE_CHANNEL = 'tiendataudio.facebook.bridge.v1'
const WEB_TO_EXTENSION = 'web-to-extension'
const EXTENSION_TO_WEB = 'extension-to-web'

type BridgeResponse = {
  channel?: unknown
  direction?: unknown
  requestId?: unknown
  type?: unknown
  ok?: unknown
  data?: unknown
  error?: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function bridgeRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `tda-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeFacebookPhotoUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const normalized = normalizePublicLinkUrl(value)
    return isFacebookLink(normalized) ? normalized : ''
  } catch {
    return ''
  }
}

export function normalizeFacebookExtensionGalleryResult(sourceValue: string, value: unknown): SocialGalleryScanResult {
  const sourceUrl = normalizePublicLinkUrl(sourceValue)
  if (!isFacebookLink(sourceUrl)) throw new Error('FACEBOOK_URL_INVALID')

  const record = asRecord(value)
  if (!record || !Array.isArray(record.images)) throw new Error('FACEBOOK_EXTENSION_RESPONSE_INVALID')

  const images: SocialGalleryImage[] = []
  const seen = new Set<string>()
  for (const item of record.images.slice(0, 50)) {
    const image = asRecord(item)
    if (!image || typeof image.imageUrl !== 'string') continue
    try {
      const imageUrl = normalizePublicLinkUrl(image.imageUrl)
      if (!isFacebookMediaLink(imageUrl) || seen.has(imageUrl)) continue
      seen.add(imageUrl)
      images.push({
        imageUrl,
        photoUrl: normalizeFacebookPhotoUrl(image.photoUrl),
        label: typeof image.label === 'string' ? image.label.slice(0, 240) : '',
      })
    } catch {
      // Ignore malformed extension candidates; the server validates the selected URLs again.
    }
  }

  if (!images.length) throw new Error('FACEBOOK_GALLERY_NOT_FOUND')
  const finalUrl = normalizeFacebookPhotoUrl(record.finalUrl) || sourceUrl
  const postText = normalizeSocialSourceText(record.postText)
  return {
    images,
    finalUrl,
    ...(postText ? { postText } : {}),
    loginRequired: record.loginRequired === true,
    partialGallery: record.partialGallery === true,
    provider: 'browser_extension',
    sessionSource: 'browser_session',
    warning: typeof record.warning === 'string' ? record.warning.slice(0, 500) : '',
  }
}

function requestBrowserBridge(type: 'PING' | 'SCAN_GALLERY', payload: Record<string, unknown> = {}, timeoutMs = 1_500) {
  if (typeof window === 'undefined') return Promise.reject(new Error('FACEBOOK_EXTENSION_UNAVAILABLE'))
  const requestId = bridgeRequestId()

  return new Promise<unknown>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('FACEBOOK_EXTENSION_UNAVAILABLE'))
    }, timeoutMs)

    const cleanup = () => {
      window.clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }

    const onMessage = (event: MessageEvent<BridgeResponse>) => {
      if (event.source !== window || event.origin !== window.location.origin) return
      const message = event.data
      if (!message
        || message.channel !== BRIDGE_CHANNEL
        || message.direction !== EXTENSION_TO_WEB
        || message.requestId !== requestId) return

      cleanup()
      if (message.ok === true) {
        resolve(message.data)
        return
      }
      const error = asRecord(message.error)
      reject(new Error(typeof error?.code === 'string' ? error.code : 'FACEBOOK_EXTENSION_FAILED'))
    }

    window.addEventListener('message', onMessage)
    window.postMessage({ channel: BRIDGE_CHANNEL, direction: WEB_TO_EXTENSION, type, requestId, payload }, window.location.origin)
  })
}

export async function detectFacebookBrowserExtension() {
  try {
    await requestBrowserBridge('PING', {}, 1_000)
    return true
  } catch {
    return false
  }
}

export async function scanFacebookGalleryWithBrowserExtension(sourceUrl: string) {
  const normalizedSourceUrl = normalizePublicLinkUrl(sourceUrl)
  if (!isFacebookLink(normalizedSourceUrl)) throw new Error('FACEBOOK_URL_INVALID')
  const result = await requestBrowserBridge('SCAN_GALLERY', { sourceUrl: normalizedSourceUrl }, 180_000)
  return normalizeFacebookExtensionGalleryResult(normalizedSourceUrl, result)
}
