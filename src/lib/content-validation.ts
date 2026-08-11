import { slugify } from './slug'
import { POST_STATUSES, type ContentArticleType, type ContentFAQ, type ContentImageLicenseStatus, type ContentImagePlan, type ContentPost, type ContentSEO, type ContentSEOClusterRole, type ContentSEOResearch, type ContentSEOSourceNote, type PostStatus } from './content-types'

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function text(value: unknown, fallback = '', maxLength = 1000) {
  return String(value ?? fallback).replace(/\r\n/g, '\n').trim().slice(0, maxLength)
}

function inlineText(value: unknown, fallback = '', maxLength = 1000) {
  return text(value, fallback, maxLength).replace(/\s+/g, ' ')
}

function stringList(value: unknown, fallback: string[] = [], maxItems = 50, maxLength = 200) {
  const source = Array.isArray(value) ? value : fallback
  return Array.from(new Set(source.map((item) => inlineText(item, '', maxLength)).filter(Boolean))).slice(0, maxItems)
}

function dateOrNull(value: unknown, fallback: string | null = null) {
  if (value === null || value === '') return null
  const candidate = inlineText(value, fallback || '', 40)
  const date = new Date(candidate)
  return candidate && Number.isFinite(date.getTime()) ? date.toISOString() : fallback
}

function normalizeFAQ(value: unknown, index: number): ContentFAQ | null {
  const input = record(value)
  const question = inlineText(input.question, '', 300)
  const answer = inlineText(input.answer, '', 2000)
  if (!question && !answer) return null
  return {
    id: inlineText(input.id, `faq-${index + 1}`, 100),
    question,
    answer,
  }
}

function normalizeSEO(value: unknown, slug: string): ContentSEO {
  const input = record(value)
  const canonicalPath = inlineText(input.canonicalPath, `/kien-thuc/${slug}`, 300)
  return {
    metaTitle: inlineText(input.metaTitle, '', 160),
    metaDescription: inlineText(input.metaDescription, '', 320),
    canonicalPath: canonicalPath.startsWith('/') ? canonicalPath : `/kien-thuc/${slug}`,
    ogTitle: inlineText(input.ogTitle, '', 160),
    ogDescription: inlineText(input.ogDescription, '', 320),
    ogImage: inlineText(input.ogImage, '', 1000),
    noIndex: Boolean(input.noIndex),
  }
}

function normalizeSEOResearch(value: unknown): ContentSEOResearch {
  const input = record(value)
  const clusterRoles: ContentSEOClusterRole[] = ['pillar', 'supporting', 'angle', 'unassigned']
  const articleTypes: ContentArticleType[] = ['Definition', 'Technical Explanation', 'Troubleshooting', 'Comparison', 'Buying Guide', 'Setup Guide', 'How-to', 'Product Technology', 'System Design', 'Acoustic / Placement', 'Commercial Investigation', 'Case Study / Project', 'FAQ / Quick Answer', 'Glossary / Concept']
  const sources = (Array.isArray(input.sources) ? input.sources : [])
    .map((source) => {
      const item = record(source)
      const tier = [1, 2, 3].includes(Number(item.tier)) ? Number(item.tier) as 1 | 2 | 3 : 3
      return {
        url: inlineText(item.url, '', 1000),
        title: inlineText(item.title, '', 300),
        publisher: inlineText(item.publisher, '', 180),
        tier,
        accessedAt: dateOrNull(item.accessedAt),
        claimNotes: stringList(item.claimNotes, [], 20, 500),
      }
    })
    .filter((source): source is ContentSEOSourceNote => Boolean(source.url))
    .slice(0, 30)
  const imageStatuses: ContentImageLicenseStatus[] = ['owned', 'licensed', 'original', 'illustration', 'IMAGE_REQUIRED', 'NEEDS_VERIFICATION']
  const imagePlan = (Array.isArray(input.imagePlan) ? input.imagePlan : [])
    .map((image) => {
      const item = record(image)
      const licenseStatus = imageStatuses.includes(item.licenseStatus as ContentImageLicenseStatus) ? item.licenseStatus as ContentImageLicenseStatus : 'NEEDS_VERIFICATION'
      return {
        url: inlineText(item.url, '', 1000),
        alt: inlineText(item.alt, '', 300),
        caption: inlineText(item.caption, '', 500),
        section: inlineText(item.section, '', 180),
        source: inlineText(item.source, '', 1000),
        licenseStatus,
        isIllustration: Boolean(item.isIllustration),
      }
    })
    .filter((image): image is ContentImagePlan => Boolean(image.alt || image.url || image.section))
    .slice(0, 20)
  const sourceCount = Number.isSafeInteger(Number(input.sourceCount))
    ? Math.max(sources.length, Math.min(50, Number(input.sourceCount)))
    : sources.length
  return {
    researchedAt: dateOrNull(input.researchedAt),
    articleType: articleTypes.includes(input.articleType as ContentArticleType) ? input.articleType as ContentArticleType : 'How-to',
    primaryKeyword: inlineText(input.primaryKeyword, '', 160),
    secondaryKeywords: stringList(input.secondaryKeywords, [], 20, 160),
    semanticTerms: stringList(input.semanticTerms, [], 40, 160),
    questionKeywords: stringList(input.questionKeywords, [], 20, 300),
    longTailKeywords: stringList(input.longTailKeywords, [], 30, 200),
    commercialModifiers: stringList(input.commercialModifiers, [], 20, 120),
    entities: stringList(input.entities, [], 30, 180),
    primaryIntent: inlineText(input.primaryIntent, '', 120),
    secondaryIntent: inlineText(input.secondaryIntent, '', 120),
    serpObservations: stringList(input.serpObservations, [], 20, 700),
    cannibalizationNotes: stringList(input.cannibalizationNotes, [], 20, 700),
    clusterRole: clusterRoles.includes(input.clusterRole as ContentSEOClusterRole) ? input.clusterRole as ContentSEOClusterRole : 'unassigned',
    sourceCount,
    sources,
    imagePlan,
  }
}

function normalizeStatus(input: UnknownRecord): PostStatus {
  if (POST_STATUSES.includes(input.status as PostStatus)) return input.status as PostStatus
  if (input.published === true) return 'published'
  return 'draft'
}

export function calculateReadingTime(markdown: string) {
  const wordCount = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 220))
}

export function normalizeContentPost(value: unknown): ContentPost {
  const input = record(value)
  const now = new Date().toISOString()
  const title = inlineText(input.title, '', 180)
  const slug = slugify(inlineText(input.slug, title, 200))
  const bodyMarkdown = text(input.bodyMarkdown ?? input.content, '', 200_000)
  const status = normalizeStatus(input)
  const primaryKeywordId = inlineText(input.primaryKeywordId, '', 100)
  const keywordIds = stringList(input.keywordIds, [], 30, 100)
  const publishedAt = dateOrNull(input.publishedAt ?? input.published_at)
  const createdAt = dateOrNull(input.createdAt ?? input.created_at, now) || now
  const updatedAt = dateOrNull(input.updatedAt ?? input.updated_at, createdAt) || createdAt

  return {
    id: inlineText(input.id, crypto.randomUUID(), 100),
    title,
    slug,
    excerpt: inlineText(input.excerpt, '', 500),
    bodyMarkdown,
    category: inlineText(input.category, 'Kiến thức âm thanh', 120),
    tags: stringList(input.tags, [], 30, 80),
    author: inlineText(input.author, 'Tiến Đạt Audio', 120),
    reviewer: inlineText(input.reviewer, '', 120),
    featuredImage: inlineText(input.featuredImage ?? input.featured_image, '', 1000),
    gallery: stringList(input.gallery, [], 20, 1000),
    primaryKeywordId,
    keywordIds: primaryKeywordId ? Array.from(new Set([primaryKeywordId, ...keywordIds])) : keywordIds,
    relatedProductIds: stringList(input.relatedProductIds, [], 30, 100),
    relatedPostIds: stringList(input.relatedPostIds, [], 20, 100),
    faqs: (Array.isArray(input.faqs) ? input.faqs : [])
      .map(normalizeFAQ)
      .filter((faq): faq is ContentFAQ => Boolean(faq))
      .slice(0, 30),
    seo: normalizeSEO(input.seo || {
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      ogImage: input.featuredImage ?? input.featured_image,
    }, slug),
    seoResearch: normalizeSEOResearch(input.seoResearch),
    status,
    scheduledAt: dateOrNull(input.scheduledAt),
    publishedAt,
    archivedAt: dateOrNull(input.archivedAt),
    createdAt,
    updatedAt,
    version: Math.max(1, Number(input.version) || 1),
    readingTime: Math.max(1, Number(input.readingTime) || calculateReadingTime(bodyMarkdown)),
  }
}

export function validateContentPost(value: unknown) {
  const post = normalizeContentPost(value)
  const errors: string[] = []
  if (post.title.length < 4) errors.push('Tiêu đề phải có ít nhất 4 ký tự')
  if (!post.slug) errors.push('Slug không hợp lệ')
  if (post.relatedPostIds.includes(post.id)) errors.push('Bài viết không thể tự liên kết với chính nó')
  if (post.faqs.some((faq) => !faq.question || !faq.answer)) errors.push('Mỗi FAQ phải có đủ câu hỏi và câu trả lời')
  if (post.status === 'scheduled' && !post.scheduledAt) errors.push('Bài hẹn giờ phải có thời điểm xuất bản')
  if (post.status === 'published' || post.status === 'scheduled') {
    if (post.excerpt.length < 20) errors.push('Bài xuất bản cần mô tả ngắn tối thiểu 20 ký tự')
    if (post.bodyMarkdown.length < 80) errors.push('Nội dung bài xuất bản quá ngắn')
    if (!post.author) errors.push('Bài xuất bản cần tên tác giả')
    if (post.seo.noIndex) errors.push('Bài xuất bản đang bật noindex; hãy tắt noindex để cho phép công cụ tìm kiếm lập chỉ mục')
    if (!post.reviewer) errors.push('Bài xuất bản cần người kiểm duyệt')
    if (!post.seoResearch.researchedAt || (!post.seoResearch.sourceCount && !post.seoResearch.serpObservations.length)) errors.push('Bài xuất bản cần SEO research có ngày và nguồn hoặc quan sát SERP')
    if (!post.seoResearch.primaryKeyword || !post.seoResearch.primaryIntent) errors.push('Bài xuất bản cần primary keyword và search intent')
    if (!/\[[^\]]+\]\(\/[^)]+\)/.test(post.bodyMarkdown) && !post.relatedPostIds.length && !post.relatedProductIds.length) errors.push('Bài xuất bản cần ít nhất một liên kết nội bộ hoặc quan hệ nội dung')
    if (/bản nháp|reviewer cần|nội dung seed|placeholder|trước khi xuất bản/i.test(post.bodyMarkdown)) errors.push('Bài xuất bản còn ghi chú seed/editorial nội bộ')
    if (!post.featuredImage || /editorial-temp|sonic-hero\.png|placeholder/i.test(post.featuredImage)) errors.push('Bài xuất bản cần ảnh sở hữu, được cấp phép hoặc minh họa đã kiểm duyệt')
  }
  return { post, errors }
}

export function hasPublicStatus(post: ContentPost, now = new Date()) {
  if (post.status === 'published') return Boolean(post.publishedAt && new Date(post.publishedAt) <= now)
  return post.status === 'scheduled' && Boolean(post.scheduledAt && new Date(post.scheduledAt) <= now)
}
