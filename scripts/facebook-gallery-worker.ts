import { normalizePublicLinkUrl, isFacebookLink } from '@/modules/social/domain/link-preview'
import { fetchPublicLinkPreview } from '@/modules/social/infrastructure/public-link-preview'
import { importSocialLinkImage } from '@/modules/social/infrastructure/social-image-import'
import { scanFacebookGallery } from '@/modules/social/infrastructure/facebook-gallery-worker'
import { releaseFacebookCdpConnection } from '@/modules/social/infrastructure/facebook-cdp-browser'
import { createSocialPost } from '@/modules/social/application/social-post-service'

type Options = {
  sourceUrl: string
  browserMode: 'temporary' | 'cdp'
  headed: boolean
  waitForLogin: boolean
  upload: boolean
  saveDraft: boolean
  maxImages: number
  storageStatePath?: string
  saveStorageStatePath?: string
}

function usage(): never {
  throw new Error('Usage: npm run social:facebook-gallery -- --url "https://www.facebook.com/story.php?..." [--cdp] [--headed] [--wait-for-login] [--storage-state .local/facebook/storage-state.json] [--save-storage-state .local/facebook/storage-state.json] [--upload] [--save-draft] [--max-images 50]')
}

function parseOptions(argv: string[]): Options {
  let sourceUrl = ''
  let browserMode: 'temporary' | 'cdp' = 'temporary'
  let headed = false
  let waitForLogin = false
  let upload = false
  let saveDraft = false
  let maxImages = 50
  let storageStatePath = ''
  let saveStorageStatePath = ''

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--url') sourceUrl = argv[++index] || ''
    else if (value === '--cdp') browserMode = 'cdp'
    else if (value === '--headed') headed = true
    else if (value === '--wait-for-login') waitForLogin = true
    else if (value === '--upload') upload = true
    else if (value === '--save-draft') saveDraft = true
    else if (value === '--storage-state') storageStatePath = argv[++index] || ''
    else if (value === '--save-storage-state') saveStorageStatePath = argv[++index] || ''
    else if (value === '--max-images') maxImages = Number(argv[++index])
    else if (!value.startsWith('-') && !sourceUrl) sourceUrl = value
    else usage()
  }

  if (!sourceUrl) usage()
  const normalizedUrl = normalizePublicLinkUrl(sourceUrl)
  if (!isFacebookLink(normalizedUrl)) throw new Error('FACEBOOK_URL_INVALID')
  if (waitForLogin && !headed) throw new Error('--wait-for-login requires --headed so you can log in manually in the temporary profile.')
  if (browserMode === 'cdp' && storageStatePath) throw new Error('--cdp cannot be combined with --storage-state; CDP uses the already-open Chrome session.')
  if (browserMode === 'cdp' && saveStorageStatePath) throw new Error('--cdp cannot save storage state; the current Chrome session must never be serialized.')
  if (saveStorageStatePath && !headed) throw new Error('--save-storage-state requires --headed so you can confirm the login before saving local session state.')
  if (saveStorageStatePath && !waitForLogin) throw new Error('--save-storage-state requires --wait-for-login to make the login step explicit.')
  if (!Number.isInteger(maxImages) || maxImages < 1 || maxImages > 50) throw new Error('--max-images must be between 1 and 50.')
  if (saveDraft) upload = true
  return {
    sourceUrl: normalizedUrl,
    browserMode,
    headed,
    waitForLogin,
    upload,
    saveDraft,
    maxImages,
    storageStatePath: storageStatePath || undefined,
    saveStorageStatePath: saveStorageStatePath || undefined,
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  try {
    if (options.saveDraft && !process.env.MONGODB_URI) throw new Error('MONGODB_REQUIRED')
    const preview = await fetchPublicLinkPreview(options.sourceUrl)
    const scan = await scanFacebookGallery({
      ...options,
      storageStateRequired: Boolean(options.storageStatePath),
    })
    const output: Record<string, unknown> = {
      sourceUrl: options.sourceUrl,
      finalUrl: scan.finalUrl,
      title: preview.title,
      description: preview.description,
      foundImages: scan.images.length,
      profileMode: options.browserMode === 'cdp' ? 'current-chrome-cdp-tab' : options.storageStatePath ? 'temporary-local-session-profile' : options.waitForLogin ? 'temporary-manual-login-profile' : 'temporary-empty-profile',
      profileRemoved: options.browserMode !== 'cdp',
      workerTabClosed: options.browserMode === 'cdp',
      loginRequired: scan.loginRequired,
      partialGallery: scan.partialGallery,
      sessionSource: scan.sessionSource,
      images: scan.images,
    }

    if (options.upload) {
      const assets = []
      for (const [index, image] of scan.images.entries()) {
        const asset = await importSocialLinkImage(image.imageUrl)
        assets.push({
          ...asset,
          order: index,
          alt: image.label || preview.title || 'Hình ảnh trong bài viết',
          sourcePhotoUrl: image.photoUrl,
        })
      }
      output.uploadedAssets = assets

      if (options.saveDraft) {
        const media = assets.map((asset) => ({
          id: `media-${crypto.randomUUID()}`,
          type: 'image' as const,
          url: asset.url,
          thumbnailUrl: asset.url,
          publicId: asset.publicId,
          width: asset.width,
          height: asset.height,
          aspectRatio: asset.width && asset.height ? asset.width / asset.height : null,
          alt: asset.alt,
          order: asset.order,
        }))
        const firstImage = media[0]?.url || preview.imageUrl
        const result = await createSocialPost({
          contentType: 'social',
          postType: 'native',
          title: preview.title,
          text: preview.description || `Xem nội dung tại ${preview.sourceUrl}`,
          excerpt: preview.description || `Liên kết public từ ${preview.domain}.`,
          category: 'Sản phẩm mới',
          tags: [],
          mentions: [],
          author: { displayName: 'Tiến Đạt Audio', avatarUrl: '', verified: true },
          media,
          links: [{ url: preview.sourceUrl, domain: preview.domain, title: preview.title, description: preview.description, imageUrl: firstImage }],
          facebookSourceUrl: preview.sourceUrl,
          facebookEmbedUrl: '',
          seo: { metaTitle: preview.title, metaDescription: preview.description, ogTitle: preview.title, ogDescription: preview.description, ogImage: firstImage, canonicalPath: '', noIndex: false },
          status: 'draft',
          relatedProductIds: [],
          relatedArticleIds: [],
          relatedProjectIds: [],
        })
        if (!result.ok) throw new Error(result.code)
        output.draft = { id: result.post.id, slug: result.post.slug, mediaCount: result.post.media.length }
      }
    }

    console.log(JSON.stringify(output, null, 2))
  } finally {
    if (options.browserMode === 'cdp') await releaseFacebookCdpConnection()
  }
  return options.browserMode
}

const isCdpInvocation = process.argv.includes('--cdp')

main().then((browserMode) => {
  if (browserMode === 'cdp') setImmediate(() => process.exit(0))
}).catch((error) => {
  const code = error instanceof Error ? error.message : 'FACEBOOK_GALLERY_FAILED'
  const messages: Record<string, string> = {
    FACEBOOK_URL_INVALID: 'Chỉ hỗ trợ URL Facebook public.',
    FACEBOOK_LOGIN_REQUIRED: 'Facebook yêu cầu đăng nhập hoặc không cho xem đủ gallery trong session hiện tại.',
    FACEBOOK_CDP_DISABLED: 'CDP Chrome local đang tắt. Hãy bật Remote Debugging trong Chrome.',
    FACEBOOK_CDP_ACTIVE_PORT_NOT_FOUND: 'Không tìm thấy DevToolsActivePort của Chrome local.',
    FACEBOOK_CDP_ACTIVE_PORT_INVALID: 'DevToolsActivePort của Chrome local không hợp lệ.',
    FACEBOOK_CDP_CONNECT_FAILED: 'Không thể kết nối vào Chrome hiện tại.',
    FACEBOOK_CDP_CONTEXT_NOT_FOUND: 'Không tìm thấy context Chrome để mở tab worker.',
    FACEBOOK_STORAGE_STATE_PATH_INVALID: 'Session state chỉ được phép nằm trong .local/facebook.',
    FACEBOOK_STORAGE_STATE_NOT_FOUND: 'Không tìm thấy session state local. Hãy tạo file bằng --save-storage-state trước.',
    FACEBOOK_STORAGE_STATE_INVALID: 'Session state local không hợp lệ hoặc không còn usable; hãy tạo lại file.',
    FACEBOOK_GALLERY_NOT_FOUND: 'Không tìm thấy gallery ảnh public sau khi trang render.',
    MONGODB_REQUIRED: 'Cần MONGODB_URI để tạo draft.',
    CLOUDINARY_REQUIRED: 'Cần cấu hình Cloudinary để upload ảnh.',
  }
  console.error(JSON.stringify({ success: false, code, message: messages[code] || 'Không thể import gallery Facebook.' }, null, 2))
  process.exitCode = 1
  if (isCdpInvocation) setImmediate(() => process.exit(1))
})
