import { lookup } from 'node:dns/promises'
import { buildPublicLinkImportPreview, isBlockedIpAddress, normalizePublicLinkUrl, type SocialLinkImportPreview } from '../domain/link-preview'

const MAX_REDIRECTS = 3
const MAX_HTML_BYTES = 512 * 1024
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const FETCH_TIMEOUT_MS = 8_000
const ALLOWED_IMAGE_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'])

export async function assertResolvablePublicUrl(url: string) {
  const hostname = new URL(url).hostname
  if (isBlockedIpAddress(hostname)) throw new Error('PUBLIC_URL_INVALID')
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length || addresses.some((address) => isBlockedIpAddress(address.address))) throw new Error('PUBLIC_URL_INVALID')
}

async function readImageBytes(response: Response) {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) throw new Error('PUBLIC_IMAGE_TOO_LARGE')
  if (!response.body) throw new Error('PUBLIC_IMAGE_UNAVAILABLE')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (total <= MAX_IMAGE_BYTES) {
    const chunk = await reader.read()
    if (chunk.done || !chunk.value) break
    if (total + chunk.value.byteLength > MAX_IMAGE_BYTES) {
      await reader.cancel()
      throw new Error('PUBLIC_IMAGE_TOO_LARGE')
    }
    chunks.push(chunk.value)
    total += chunk.value.byteLength
  }
  return Buffer.concat(chunks)
}

export type PublicImagePayload = {
  buffer: Buffer
  contentType: string
  resolvedUrl: string
}

export async function fetchPublicImage(input: string): Promise<PublicImagePayload> {
  let currentUrl = normalizePublicLinkUrl(input)

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    try {
      await assertResolvablePublicUrl(currentUrl)
    } catch (error) {
      if (error instanceof Error && error.message === 'PUBLIC_URL_INVALID') throw error
      throw new Error('PUBLIC_IMAGE_UNAVAILABLE')
    }

    let response: Response
    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: { accept: 'image/avif,image/webp,image/apng,image/*', 'user-agent': 'TiendatAudioSocialImageImport/1.0' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
    } catch {
      throw new Error('PUBLIC_IMAGE_UNAVAILABLE')
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirect === MAX_REDIRECTS) throw new Error('PUBLIC_IMAGE_REDIRECT_LIMIT')
      try {
        currentUrl = normalizePublicLinkUrl(new URL(location, currentUrl).toString())
        continue
      } catch {
        throw new Error('PUBLIC_URL_INVALID')
      }
    }

    if (!response.ok) throw new Error('PUBLIC_IMAGE_UNAVAILABLE')
    const contentType = (response.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase()
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) throw new Error('PUBLIC_IMAGE_UNSUPPORTED')
    const buffer = await readImageBytes(response)
    if (!buffer.length) throw new Error('PUBLIC_IMAGE_UNAVAILABLE')
    return { buffer, contentType, resolvedUrl: normalizePublicLinkUrl(response.url || currentUrl) }
  }

  throw new Error('PUBLIC_IMAGE_REDIRECT_LIMIT')
}

async function readHtml(response: Response) {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) return ''
  if (!response.body) return ''

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (total < MAX_HTML_BYTES) {
    const chunk = await reader.read()
    if (chunk.done || !chunk.value) break
    const remaining = MAX_HTML_BYTES - total
    const value = chunk.value.byteLength > remaining ? chunk.value.slice(0, remaining) : chunk.value
    chunks.push(value)
    total += value.byteLength
    if (value.byteLength < chunk.value.byteLength) {
      await reader.cancel()
      break
    }
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function fetchPublicLinkPreview(input: string): Promise<SocialLinkImportPreview> {
  const sourceUrl = normalizePublicLinkUrl(input)
  let currentUrl = sourceUrl
  let html = ''
  let warning = ''
  let resolvedUrl = sourceUrl

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    try {
      await assertResolvablePublicUrl(currentUrl)
    } catch (error) {
      if (error instanceof Error && error.message === 'PUBLIC_URL_INVALID') throw error
      warning = 'Không thể kiểm tra máy chủ đích; hệ thống vẫn giữ lại liên kết để bạn xác nhận.'
      break
    }

    let response: Response
    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'TiendatAudioSocialPreview/1.0' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
    } catch {
      warning = 'Không lấy được metadata tự động; liên kết vẫn có thể được chèn thủ công.'
      break
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirect === MAX_REDIRECTS) {
        warning = 'Liên kết có quá nhiều lần chuyển hướng; hệ thống giữ URL gốc.'
        break
      }
      try {
        currentUrl = normalizePublicLinkUrl(new URL(location, currentUrl).toString())
        continue
      } catch {
        warning = 'Liên kết chuyển hướng tới địa chỉ không hợp lệ; hệ thống giữ URL gốc.'
        break
      }
    }

    resolvedUrl = normalizePublicLinkUrl(response.url || currentUrl)
    if (!response.ok) {
      warning = 'Máy chủ nguồn không cho phép đọc metadata; hệ thống vẫn giữ lại liên kết.'
      break
    }
    if (!(response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
      warning = 'URL không trả về trang HTML; hệ thống chỉ chèn liên kết.'
      break
    }
    html = await readHtml(response)
    break
  }

  return buildPublicLinkImportPreview({ sourceUrl, resolvedUrl, html, warning })
}
