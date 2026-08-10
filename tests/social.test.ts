import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { Script } from 'node:vm'
import { getSocialMediaLayout } from '../src/modules/social/domain/media-layout'
import { buildPublicLinkImportPreview, isFacebookMediaLink, normalizePublicLinkUrl } from '../src/modules/social/domain/link-preview'
import { applyNativeSocialGalleryImport, applyNativeSocialLinkImport } from '../src/modules/social/domain/native-import'
import { isFacebookBlockingLoginText } from '../src/modules/social/infrastructure/facebook-gallery-worker'
import { parseFacebookCdpActivePort } from '../src/modules/social/infrastructure/facebook-cdp-browser'
import { resolveFacebookStorageStatePath } from '../src/modules/social/infrastructure/facebook-session-state'
import { normalizeFacebookExtensionGalleryResult } from '../src/modules/social/infrastructure/facebook-browser-extension'
import { getDisplaySocialText, getSocialDiscoveryDescription, getSocialDiscoveryTitle, isGeneratedSocialSourceText, resolveImportedSocialText } from '../src/modules/social/domain/source-content'
import { hasPublicSocialStatus, normalizeSocialPost, validateSocialPost } from '../src/modules/social/domain/validation'
import { buildImportedSocialSlug, buildSocialPostSlug, extractFacebookPostIdentity } from '../src/modules/social/domain/slug'
import type { SocialMediaItem } from '../src/modules/social/domain/types'

test('social media layout follows the editorial gallery contract', () => {
  const media = (count: number): SocialMediaItem[] => Array.from({ length: count }, (_, index) => ({ id: String(index), type: 'image', url: `https://cdn.example.com/${index}.jpg`, thumbnailUrl: '', publicId: '', width: null, height: null, aspectRatio: null, alt: `Image ${index}`, order: index }))
  assert.equal(getSocialMediaLayout([]), 'empty')
  assert.equal(getSocialMediaLayout(media(1)), 'single')
  assert.equal(getSocialMediaLayout(media(2)), 'split')
  assert.equal(getSocialMediaLayout(media(3)), 'featured-stack')
  assert.equal(getSocialMediaLayout(media(4)), 'grid')
  assert.equal(getSocialMediaLayout(media(5)), 'overflow-grid')
})

test('social normalization keeps safe media hosts and derives stable metadata', () => {
  const post = normalizeSocialPost({
    title: 'Setup nghe nhạc tại showroom',
    text: 'Một cấu hình nghe thử có ngữ cảnh rõ ràng.',
    media: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=abc123', alt: 'Video setup' },
      { type: 'youtube', url: 'https://evil.example/embed/abc123', alt: 'Không được phép' },
    ],
  })
  assert.equal(post.slug, 'setup-nghe-nhac-tai-showroom')
  assert.equal(post.media.length, 1)
  assert.equal(post.media[0].type, 'youtube')
  assert.equal(post.seo.canonicalPath, '/bai-viet/setup-nghe-nhac-tai-showroom')
})

test('social normalization keeps legacy slugs for backward-compatible redirects', () => {
  const post = normalizeSocialPost({ title: 'Facebook', slug: 'facebook-1774163126949309', legacySlugs: ['facebook', ''] })
  assert.deepEqual(post.legacySlugs, ['facebook'])
})

test('public social status requires a publish time that has arrived', () => {
  const now = new Date('2026-08-09T00:00:00.000Z')
  const published = normalizeSocialPost({ title: 'Bài public', text: 'Nội dung bài public đủ rõ ràng.', status: 'published', publishedAt: '2026-08-08T00:00:00.000Z' })
  const scheduled = normalizeSocialPost({ title: 'Bài hẹn giờ', text: 'Nội dung bài hẹn giờ đủ rõ ràng.', status: 'scheduled', scheduledAt: '2026-08-10T00:00:00.000Z' })
  assert.equal(hasPublicSocialStatus(published, now), true)
  assert.equal(hasPublicSocialStatus(scheduled, now), false)
})

test('facebook embed requires an allowlisted Facebook URL', () => {
  const result = validateSocialPost({ title: 'Facebook post', postType: 'facebook_embed', facebookEmbedUrl: 'https://evil.example/post' })
  assert.ok(result.errors.some((error) => error.includes('Facebook Embed')))
})

test('public image media requires alt text', () => {
  const result = validateSocialPost({ title: 'Bài có hình', text: 'Nội dung có hình ảnh đủ rõ ràng.', media: [{ type: 'image', url: 'https://cdn.example.com/room.jpg' }] })
  assert.ok(result.errors.some((error) => error.includes('alt text')))
})

test('public link preview parses Open Graph metadata and creates a Facebook embed URL', () => {
  const preview = buildPublicLinkImportPreview({
    sourceUrl: 'https://www.facebook.com/share/p/19MNgqjQdp/',
    html: '<html><head><meta property="og:title" content="Setup nghe nhạc thực tế"><meta property="og:description" content="Một cấu hình được lắp đặt tại showroom."><meta property="og:image" content="/images/setup.jpg"></head></html>',
  })
  assert.equal(preview.kind, 'facebook')
  assert.equal(preview.title, 'Setup nghe nhạc thực tế')
  assert.equal(preview.description, 'Một cấu hình được lắp đặt tại showroom.')
  assert.equal(preview.imageUrl, 'https://www.facebook.com/images/setup.jpg')
  assert.match(preview.facebookEmbedUrl, /plugins\/post\.php\?href=/)
})

test('public link preview rejects local and non-http URLs before fetching', () => {
  assert.throws(() => normalizePublicLinkUrl('http://127.0.0.1:3000/admin'), /PUBLIC_URL_INVALID/)
  assert.throws(() => normalizePublicLinkUrl('http://[::1]/admin'), /PUBLIC_URL_INVALID/)
  assert.throws(() => normalizePublicLinkUrl('file:///etc/passwd'), /PUBLIC_URL_INVALID/)
  assert.throws(() => normalizePublicLinkUrl('https://localhost/'), /PUBLIC_URL_INVALID/)
})

test('social source content prefers captured post text and hides URL-only fallback', () => {
  assert.equal(isGeneratedSocialSourceText('Xem nội dung tại https://www.facebook.com/story.php?id=1'), true)
  assert.equal(getDisplaySocialText('Xem nội dung tại https://www.facebook.com/story.php?id=1'), '')
  assert.equal(resolveImportedSocialText({ currentText: 'Xem nội dung tại https://www.facebook.com/story.php?id=1', sourceText: 'Bán cặp loa tại showroom.' }), 'Bán cặp loa tại showroom.')
  assert.equal(resolveImportedSocialText({ currentText: 'Xem nội dung tại https://www.facebook.com/story.php?id=1' }), '')
})

test('social discovery metadata replaces generic Facebook labels with real post content', () => {
  const text = 'Bán cặp loa monitor đồng trục bãi, đẹp như hình và đang có tại showroom.'
  assert.equal(getSocialDiscoveryTitle({ title: 'Facebook', text, category: 'Sản phẩm mới' }), text)
  assert.equal(getSocialDiscoveryDescription({ text, excerpt: 'Xem nội dung tại https://www.facebook.com/story.php?id=1' }), text)
  assert.equal(getSocialDiscoveryTitle({ title: 'Bông Trương', text }), 'Bông Trương')
})

test('social source slugs stay readable and unique for repeated Facebook imports', () => {
  const source = 'https://www.facebook.com/story.php?story_fbid=1774163126949309&id=100030669150233'
  assert.equal(extractFacebookPostIdentity(source), '1774163126949309')
  assert.equal(buildSocialPostSlug('Bông Trương', source), 'bong-truong-1774163126949309')
  assert.notEqual(
    buildSocialPostSlug('Bông Trương', source),
    buildSocialPostSlug('Bông Trương', 'https://www.facebook.com/story.php?story_fbid=1774163126949310&id=100030669150233'),
  )
  assert.equal(buildSocialPostSlug('Bài thủ công'), 'bai-thu-cong')
  assert.equal(buildImportedSocialSlug('bong-truong', 'Bông Trương', 'Bông Trương', source), 'bong-truong-1774163126949309')
  assert.equal(buildImportedSocialSlug('custom-slug', 'Bông Trương', 'Bông Trương', source), 'custom-slug')
})

test('facebook gallery accepts CDN media and maps selected assets in order', () => {
  assert.equal(isFacebookMediaLink('https://scontent.fsgn2-7.fna.fbcdn.net/photo.jpg'), true)
  assert.equal(isFacebookMediaLink('https://evil.example/photo.jpg'), false)
  const post = normalizeSocialPost({ title: 'Draft', status: 'draft' })
  const preview = buildPublicLinkImportPreview({ sourceUrl: 'https://www.facebook.com/story.php?story_fbid=1&id=2' })
  const next = applyNativeSocialGalleryImport(post, preview, [
    { url: 'https://res.cloudinary.com/demo/image/upload/one.jpg', publicId: 'social/one', width: 800, height: 600, bytes: 100, format: 'jpg', alt: 'Ảnh một' },
    { url: 'https://res.cloudinary.com/demo/image/upload/two.jpg', publicId: 'social/two', width: 800, height: 600, bytes: 100, format: 'jpg', alt: 'Ảnh hai' },
  ])
  assert.equal(next.postType, 'native')
  assert.deepEqual(next.media.map((item) => item.publicId), ['social/one', 'social/two'])
  assert.deepEqual(next.media.map((item) => item.order), [0, 1])
  assert.equal(next.media[1].alt, 'Ảnh hai')
})

test('native Facebook gallery import stores captured post text instead of the source URL', () => {
  const post = normalizeSocialPost({ title: 'Facebook', text: 'Xem nội dung tại https://www.facebook.com/story.php?id=1', status: 'draft' })
  const preview = buildPublicLinkImportPreview({ sourceUrl: 'https://www.facebook.com/story.php?story_fbid=1&id=2' })
  const next = applyNativeSocialGalleryImport(post, preview, [], 'Bán cặp loa tại showroom.')
  assert.equal(next.text, 'Bán cặp loa tại showroom.')
})

test('facebook worker ignores the public header login form but detects blocking login copy', () => {
  assert.equal(isFacebookBlockingLoginText('Email or phone Password Log in'), false)
  assert.equal(isFacebookBlockingLoginText('Log in to continue viewing this photo'), true)
  assert.equal(isFacebookBlockingLoginText('Đăng nhập để xem thêm ảnh'), true)
})

test('facebook session state is restricted to the ignored local directory', () => {
  assert.match(resolveFacebookStorageStatePath('.local/facebook/storage-state.json') || '', /\.local[\\/]facebook[\\/]storage-state\.json$/)
  assert.throws(() => resolveFacebookStorageStatePath('.env.local'), /FACEBOOK_STORAGE_STATE_PATH_INVALID/)
  assert.throws(() => resolveFacebookStorageStatePath('/tmp/facebook-state.json'), /FACEBOOK_STORAGE_STATE_PATH_INVALID/)
})

test('facebook CDP active port resolves only a local browser websocket endpoint', () => {
  assert.equal(parseFacebookCdpActivePort('9222\n/devtools/browser/abc-123\n'), 'ws://127.0.0.1:9222/devtools/browser/abc-123')
  assert.throws(() => parseFacebookCdpActivePort('9222\n/json/version'), /FACEBOOK_CDP_ACTIVE_PORT_INVALID/)
  assert.throws(() => parseFacebookCdpActivePort('not-a-port\n/devtools/browser/abc'), /FACEBOOK_CDP_ACTIVE_PORT_INVALID/)
})

test('native social import uses cached media and removes the broken embed fallback', () => {
  const post = normalizeSocialPost({ title: 'Draft', status: 'draft' })
  post.title = ''
  post.slug = ''
  post.seo = { ...post.seo, canonicalPath: '' }
  const preview = buildPublicLinkImportPreview({
    sourceUrl: 'https://www.facebook.com/story.php?story_fbid=1774163126949309&id=100030669150233',
    html: '<meta property="og:title" content="Bông Trương"><meta property="og:description" content="Bán cặp loa tại showroom."><meta property="og:image" content="https://cdn.example.com/source.jpg">',
  })
  const next = applyNativeSocialLinkImport(post, preview, { url: 'https://res.cloudinary.com/demo/image/upload/social.jpg', publicId: 'social/imported/social', width: 1200, height: 800, bytes: 1200, format: 'jpg' })
  assert.equal(next.postType, 'native')
  assert.equal(next.title, 'Bông Trương')
  assert.equal(next.slug, 'bong-truong-1774163126949309')
  assert.equal(next.text, 'Bán cặp loa tại showroom.')
  assert.equal(next.facebookSourceUrl, preview.sourceUrl)
  assert.equal(next.facebookEmbedUrl, '')
  assert.equal(next.media[0].publicId, 'social/imported/social')
  assert.equal(next.links[0].imageUrl, 'https://res.cloudinary.com/demo/image/upload/social.jpg')
  assert.equal(next.seo.ogImage, 'https://res.cloudinary.com/demo/image/upload/social.jpg')
  assert.equal(normalizeSocialPost(next).facebookSourceUrl, preview.sourceUrl)
})

test('browser extension gallery result is allowlisted, deduplicated and marked as browser session', () => {
  const result = normalizeFacebookExtensionGalleryResult('https://www.facebook.com/story.php?story_fbid=1&id=2', {
    images: [
      { imageUrl: 'https://scontent.fsgn2-7.fna.fbcdn.net/photo-one.jpg?token=1', photoUrl: 'https://www.facebook.com/photo/?fbid=1', label: 'Ảnh một' },
      { imageUrl: 'https://scontent.fsgn2-7.fna.fbcdn.net/photo-one.jpg?token=1', photoUrl: 'https://www.facebook.com/photo/?fbid=1', label: 'Trùng' },
      { imageUrl: 'https://evil.example/private.jpg', photoUrl: 'https://evil.example/post', label: 'Không hợp lệ' },
    ],
    postText: 'Bán cặp loa tại showroom.',
    finalUrl: 'https://www.facebook.com/photo/?fbid=1',
  })
  assert.equal(result.images.length, 1)
  assert.equal(result.images[0].label, 'Ảnh một')
  assert.equal(result.provider, 'browser_extension')
  assert.equal(result.sessionSource, 'browser_session')
  assert.equal(result.postText, 'Bán cặp loa tại showroom.')
})

test('browser extension manifest keeps narrow permissions and all scripts initialize', () => {
  const extensionRoot = resolve(process.cwd(), 'extensions/facebook-import-bridge')
  const manifest = JSON.parse(readFileSync(resolve(extensionRoot, 'manifest.json'), 'utf8')) as {
    manifest_version?: number
    permissions?: string[]
    host_permissions?: string[]
  }
  assert.equal(manifest.manifest_version, 3)
  assert.deepEqual(manifest.permissions, ['tabs'])
  assert.equal(manifest.permissions?.includes('cookies'), false)
  assert.equal(manifest.permissions?.includes('debugger'), false)
  assert.ok(manifest.host_permissions?.includes('https://tiendataudioquangngai.id.vn/*'))
  for (const filename of ['admin-bridge.js', 'service-worker.js', 'facebook-scanner.js']) {
    const script = new Script(readFileSync(resolve(extensionRoot, filename), 'utf8'), { filename })
    assert.doesNotThrow(() => script.runInNewContext({
      chrome: {
        runtime: {
          getManifest: () => manifest,
          lastError: null,
          onMessage: { addListener: () => undefined },
          sendMessage: () => undefined,
        },
      },
      window: {
        addEventListener: () => undefined,
        location: { href: 'https://tiendataudioquangngai.id.vn/admin/social-posts/new', origin: 'https://tiendataudioquangngai.id.vn', pathname: '/admin/social-posts/new' },
        postMessage: () => undefined,
      },
    }))
  }
})
