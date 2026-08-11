import type { ContentPost } from './content-types'
import type { SEOConfig, SEOKeyword } from './seo-types'

export type KeywordCoverageState = 'published' | 'in_progress' | 'uncovered'

export function deriveContentSEOInsights(config: SEOConfig, posts: ContentPost[]) {
  const activeKeywords = config.keywords.filter((keyword) => keyword.isActive)
  const coverage = activeKeywords.map((keyword) => {
    const mappedPosts = posts.filter((post) => post.keywordIds.includes(keyword.id) && post.status !== 'archived')
    const published = mappedPosts.filter((post) => post.status === 'published')
    const state: KeywordCoverageState = published.length ? 'published' : mappedPosts.length ? 'in_progress' : 'uncovered'
    return { keyword, state, postIds: mappedPosts.map((post) => post.id), publishedPostIds: published.map((post) => post.id) }
  })
  const orphanPosts = posts.filter((post) => post.status === 'published' && !post.relatedPostIds.length && !/\]\(\/kien-thuc\//.test(post.bodyMarkdown))
  return {
    coverage,
    uncoveredKeywords: coverage.filter((item) => item.state === 'uncovered'),
    cannibalizedKeywords: coverage.filter((item) => item.publishedPostIds.length > 1),
    orphanPosts,
  }
}

export function buildKeywordDraft(keyword: SEOKeyword) {
  const title = keyword.brief?.angle || `Hướng dẫn ${keyword.term}`
  const questions = keyword.brief?.questions.length
    ? keyword.brief.questions
    : [`${keyword.term} phù hợp với nhu cầu nào?`, `Cần kiểm tra gì trước khi lựa chọn?`]
  const secondaryTerms = keyword.brief?.secondaryTerms || []
  const bodyMarkdown = [
    `## ${title}`,
    '',
    keyword.notes || `Bài viết này giải đáp nhu cầu tìm hiểu về ${keyword.term} bằng thông tin có thể kiểm chứng và kinh nghiệm triển khai thực tế.`,
    '',
    ...questions.flatMap((question) => [`## ${question}`, '', 'Nội dung cần biên tập và xác minh trước khi xuất bản.', '']),
    '## Checklist trước khi quyết định',
    '',
    '- Xác định không gian và mục đích sử dụng.',
    '- Đối chiếu thông số với thiết bị đang có.',
    '- Nghe thử hoặc trao đổi với kỹ thuật viên khi có thể.',
    '',
    '## Bước tiếp theo',
    '',
    keyword.brief?.callToAction || 'Liên hệ Tiến Đạt Audio để nhận tư vấn theo không gian, nhu cầu và ngân sách thực tế.',
  ].join('\n')
  return {
    title,
    excerpt: `Thông tin thực tế về ${keyword.term}, các tiêu chí lựa chọn và bước kiểm tra trước khi quyết định.`,
    bodyMarkdown,
    status: 'draft',
    primaryKeywordId: keyword.id,
    keywordIds: [keyword.id],
    tags: Array.from(new Set([keyword.cluster, ...secondaryTerms])).filter(Boolean),
    seo: {
      metaTitle: title.slice(0, 60),
      metaDescription: `Tìm hiểu ${keyword.term}, tiêu chí lựa chọn và kinh nghiệm thực tế từ Tiến Đạt Audio.`.slice(0, 160),
      canonicalPath: '',
      ogTitle: title,
      ogDescription: '',
      ogImage: '',
      noIndex: true,
    },
  }
}

export function suggestInternalLinks(post: ContentPost, posts: ContentPost[], config: SEOConfig) {
  const keywordMap = new Map(config.keywords.map((keyword) => [keyword.id, keyword]))
  const sourceClusters = new Set(post.keywordIds.map((id) => keywordMap.get(id)?.cluster).filter(Boolean))
  return posts
    .filter((candidate) => candidate.id !== post.id && candidate.status === 'published')
    .map((candidate) => {
      const sharedKeywordIds = candidate.keywordIds.filter((id) => post.keywordIds.includes(id))
      const sharedClusters = candidate.keywordIds
        .map((id) => keywordMap.get(id)?.cluster)
        .filter((cluster): cluster is string => Boolean(cluster && sourceClusters.has(cluster)))
      const relevance = sharedKeywordIds.length * 3 + new Set(sharedClusters).size * 2 + (candidate.category === post.category ? 1 : 0)
      return { post: candidate, relevance, anchorText: keywordMap.get(sharedKeywordIds[0])?.term || candidate.title }
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 8)
}

export function getContentChecklist(post: ContentPost, keyword?: SEOKeyword) {
  const primaryTerm = keyword?.term.toLocaleLowerCase('vi') || ''
  const title = post.title.toLocaleLowerCase('vi')
  const excerpt = post.excerpt.toLocaleLowerCase('vi')
  const body = post.bodyMarkdown.toLocaleLowerCase('vi')
  return [
    { id: 'title', label: 'Tiêu đề rõ ràng, không quá 65 ký tự', pass: post.title.length >= 20 && post.title.length <= 65 },
    { id: 'excerpt', label: 'Excerpt từ 80–180 ký tự', pass: post.excerpt.length >= 80 && post.excerpt.length <= 180 },
    { id: 'body', label: 'Nội dung đủ chiều sâu (tối thiểu 600 từ)', pass: post.bodyMarkdown.split(/\s+/).filter(Boolean).length >= 600 },
    { id: 'headings', label: 'Có cấu trúc H2/H3', pass: /^##\s/m.test(post.bodyMarkdown) },
    { id: 'keyword', label: 'Primary keyword xuất hiện tự nhiên trong title/excerpt/body', pass: !primaryTerm || title.includes(primaryTerm) || excerpt.includes(primaryTerm) || body.includes(primaryTerm) },
    { id: 'meta', label: 'Meta title và description đã biên tập', pass: post.seo.metaTitle.length >= 20 && post.seo.metaDescription.length >= 80 },
    { id: 'image', label: 'Có featured image và OG image', pass: Boolean(post.featuredImage && (post.seo.ogImage || post.featuredImage)) },
    { id: 'image-plan', label: 'Image plan có alt, vị trí và license đã xác nhận', pass: post.seoResearch.imagePlan.length > 0 && post.seoResearch.imagePlan.every((image) => Boolean(image.alt && image.section && image.licenseStatus && !['IMAGE_REQUIRED', 'NEEDS_VERIFICATION'].includes(image.licenseStatus))) },
    { id: 'links', label: 'Có liên kết nội bộ hoặc bài liên quan', pass: post.relatedPostIds.length > 0 || /\]\(\/(kien-thuc|products|san-pham)\//.test(post.bodyMarkdown) },
    { id: 'research', label: 'Có SEO research: ngày, intent và nguồn/quan sát SERP', pass: Boolean(post.seoResearch.researchedAt && post.seoResearch.primaryKeyword && post.seoResearch.primaryIntent && (post.seoResearch.sourceCount > 0 || post.seoResearch.serpObservations.length > 0)) },
    { id: 'reviewer', label: 'Có người kiểm duyệt nội dung', pass: Boolean(post.reviewer) },
  ]
}
