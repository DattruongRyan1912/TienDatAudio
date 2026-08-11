import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasPublicStatus, normalizeContentPost, validateContentPost } from '../src/lib/content-validation'

const base = {
  id: 'post-test',
  title: 'Bài viết kiểm thử về phối ghép loa',
  slug: 'bai-viet-kiem-thu-ve-phoi-ghep-loa',
  excerpt: 'Đây là một mô tả đủ dài để kiểm thử bài viết public trong hệ thống.',
  content: `${'Nội dung đã được kiểm thử. '.repeat(30)}\n\n## Phần tiếp theo\n\nĐọc thêm [hướng dẫn liên quan](/kien-thuc/bai-lien-quan).`,
  published: true,
  publishedAt: '2026-01-01T00:00:00.000Z',
  reviewer: 'Reviewer kiểm thử',
  featuredImage: '/images/verified-editorial.jpg',
  seoResearch: {
    researchedAt: '2026-01-01T00:00:00.000Z',
    primaryKeyword: 'phối ghép loa',
    primaryIntent: 'informational',
    sourceCount: 1,
    sources: [{ url: 'https://example.com/source', title: 'Nguồn kiểm thử', publisher: 'Example', tier: 2, accessedAt: '2026-01-01T00:00:00.000Z', claimNotes: ['Kiểm thử schema'] }],
  },
}

test('legacy content maps to markdown and published workflow', () => {
  const post = normalizeContentPost(base)
  assert.equal(post.bodyMarkdown.startsWith('Nội dung'), true)
  assert.equal(post.status, 'published')
  assert.equal(post.readingTime >= 1, true)
  assert.equal(hasPublicStatus(post, new Date('2026-02-01T00:00:00.000Z')), true)
})

test('draft is not public and published content validates', () => {
  const draft = normalizeContentPost({ ...base, status: 'draft', published: false, publishedAt: null })
  assert.equal(hasPublicStatus(draft), false)
  const { errors } = validateContentPost(normalizeContentPost(base))
  assert.deepEqual(errors, [])
})

test('published editorial content rejects an accidental noindex flag', () => {
  const { errors } = validateContentPost(normalizeContentPost({
    ...base,
    seo: { metaTitle: 'Bài viết về phối ghép loa', metaDescription: 'Mô tả đủ dài cho bài viết đã được kiểm thử.', noIndex: true },
  }))
  assert.ok(errors.some((error) => error.includes('noindex')))
})

test('scheduled content only becomes public after schedule time', () => {
  const scheduled = normalizeContentPost({ ...base, status: 'scheduled', scheduledAt: '2026-12-01T00:00:00.000Z', publishedAt: null })
  assert.equal(hasPublicStatus(scheduled, new Date('2026-11-30T00:00:00.000Z')), false)
  assert.equal(hasPublicStatus(scheduled, new Date('2026-12-02T00:00:00.000Z')), true)
})
