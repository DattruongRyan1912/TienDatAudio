import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSocialMediaLayout } from '../src/modules/social/domain/media-layout'
import { hasPublicSocialStatus, normalizeSocialPost, validateSocialPost } from '../src/modules/social/domain/validation'
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
