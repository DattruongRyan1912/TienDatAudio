import { isFacebookLink, isFacebookMediaLink, normalizePublicLinkUrl } from '../domain/link-preview'
import { fetchPublicLinkPreview } from '../infrastructure/public-link-preview'
import { importSocialLinkImage } from '../infrastructure/social-image-import'

export async function previewPublicSocialLink(value: unknown) {
  if (typeof value !== 'string') throw new Error('PUBLIC_URL_REQUIRED')
  return fetchPublicLinkPreview(value)
}

export async function importPublicSocialLinkImage(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('PUBLIC_URL_REQUIRED')
  const preview = await fetchPublicLinkPreview(value)
  if (!preview.imageUrl) throw new Error('PUBLIC_IMAGE_MISSING')
  const asset = await importSocialLinkImage(preview.imageUrl)
  return { preview, asset }
}

export async function scanFacebookSocialGallery(value: unknown, options: { browserMode?: 'temporary' | 'cdp'; headed?: boolean; waitForLogin?: boolean; maxImages?: number; storageStatePath?: string; storageStateRequired?: boolean; saveStorageStatePath?: string } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('PUBLIC_URL_REQUIRED')
  const sourceUrl = normalizePublicLinkUrl(value)
  if (!isFacebookLink(sourceUrl)) throw new Error('FACEBOOK_URL_INVALID')
  if (process.env.SOCIAL_FACEBOOK_WORKER_ENABLED !== 'true') throw new Error('FACEBOOK_WORKER_DISABLED')

  const preview = await fetchPublicLinkPreview(sourceUrl)
  const { scanFacebookGallery } = await import('../infrastructure/facebook-gallery-worker')
  const scan = await scanFacebookGallery({ sourceUrl, ...options })
  return { preview, ...scan }
}

export async function importPublicSocialGalleryImages(value: unknown, valueImages: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('PUBLIC_URL_REQUIRED')
  const sourceUrl = normalizePublicLinkUrl(value)
  if (!isFacebookLink(sourceUrl)) throw new Error('FACEBOOK_URL_INVALID')
  if (!Array.isArray(valueImages) || valueImages.length === 0) throw new Error('GALLERY_IMAGES_REQUIRED')

  const candidates = valueImages.slice(0, 50).map((item) => {
    if (!item || typeof item !== 'object') throw new Error('GALLERY_IMAGE_INVALID')
    const image = item as { imageUrl?: unknown; photoUrl?: unknown; label?: unknown }
    if (typeof image.imageUrl !== 'string' || !image.imageUrl.trim()) throw new Error('GALLERY_IMAGE_INVALID')
    const imageUrl = normalizePublicLinkUrl(image.imageUrl)
    if (!isFacebookMediaLink(imageUrl)) throw new Error('GALLERY_IMAGE_INVALID')
    return {
      imageUrl,
      photoUrl: typeof image.photoUrl === 'string' ? image.photoUrl.slice(0, 2_048) : '',
      label: typeof image.label === 'string' ? image.label.slice(0, 240) : '',
    }
  }).filter((item, index, all) => all.findIndex((candidate) => candidate.imageUrl === item.imageUrl) === index)

  const assets = []
  for (const candidate of candidates) {
    const asset = await importSocialLinkImage(candidate.imageUrl)
    assets.push({
      ...asset,
      alt: candidate.label || 'Hình ảnh trong bài viết',
      sourcePhotoUrl: candidate.photoUrl,
    })
  }
  return { sourceUrl, assets }
}
