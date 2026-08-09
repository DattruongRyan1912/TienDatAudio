export const POST_STATUSES = ['idea', 'draft', 'review', 'scheduled', 'published', 'archived'] as const
export type PostStatus = typeof POST_STATUSES[number]

export interface ContentFAQ {
  id: string
  question: string
  answer: string
}

export interface ContentSEO {
  metaTitle: string
  metaDescription: string
  canonicalPath: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  noIndex: boolean
}

export interface ContentPost {
  id: string
  title: string
  slug: string
  excerpt: string
  bodyMarkdown: string
  category: string
  tags: string[]
  author: string
  reviewer: string
  featuredImage: string
  gallery: string[]
  primaryKeywordId: string
  keywordIds: string[]
  relatedProductIds: string[]
  relatedPostIds: string[]
  faqs: ContentFAQ[]
  seo: ContentSEO
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
  readingTime: number
}

export interface PostRevision {
  id: string
  postId: string
  version: number
  snapshot: ContentPost
  reason: 'published' | 'published_update' | 'manual_restore'
  actor: string
  createdAt: string
}

export interface PostListFilters {
  status?: PostStatus | 'all'
  search?: string
  keywordId?: string
  category?: string
  limit?: number
  page?: number
}

export interface PaginatedPosts {
  items: ContentPost[]
  total: number
  page: number
  limit: number
}

export type ContentMutationResult =
  | { ok: true; post: ContentPost }
  | { ok: false; code: 'NOT_FOUND' | 'VERSION_CONFLICT' | 'SLUG_CONFLICT'; current?: ContentPost }
