import type { PostStatus } from '@/lib/content-types'

export const SOCIAL_POST_TYPES = ['native', 'facebook_embed'] as const
export type SocialPostType = typeof SOCIAL_POST_TYPES[number]

export const SOCIAL_MEDIA_TYPES = ['image', 'video', 'youtube', 'facebook'] as const
export type SocialMediaType = typeof SOCIAL_MEDIA_TYPES[number]

export const SOCIAL_CATEGORIES = ['Sản phẩm mới', 'Setup thực tế', 'Kiến thức nhanh', 'Khuyến mãi', 'Showroom', 'Behind the scenes', 'Review nhanh', 'Dự án', 'Sự kiện', 'Video'] as const
export type SocialCategory = typeof SOCIAL_CATEGORIES[number]

export interface SocialAuthor {
  displayName: string
  avatarUrl: string
  verified: boolean
}

export interface SocialMediaItem {
  id: string
  type: SocialMediaType
  url: string
  thumbnailUrl: string
  publicId: string
  width: number | null
  height: number | null
  aspectRatio: number | null
  alt: string
  order: number
}

export interface SocialLinkPreview {
  url: string
  domain: string
  title: string
  description: string
  imageUrl: string
}

export interface SocialEngagementSnapshot {
  source: 'facebook_sync' | 'manual_reference' | 'none'
  capturedAt: string
  likes?: number
  comments?: number
  shares?: number
}

export interface SocialSEO {
  metaTitle: string
  metaDescription: string
  canonicalPath: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  noIndex: boolean
}

export interface SocialPost {
  id: string
  contentType: 'social'
  postType: SocialPostType
  title: string
  slug: string
  excerpt: string
  text: string
  category: string
  tags: string[]
  mentions: string[]
  author: SocialAuthor
  media: SocialMediaItem[]
  links: SocialLinkPreview[]
  facebookSourceUrl: string
  facebookEmbedUrl: string
  relatedProductIds: string[]
  relatedArticleIds: string[]
  relatedProjectIds: string[]
  engagement?: SocialEngagementSnapshot
  seo: SocialSEO
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface SocialPostRevision {
  id: string
  postId: string
  version: number
  snapshot: SocialPost
  reason: 'published' | 'published_update' | 'manual_restore'
  actor: string
  createdAt: string
}

export interface SocialPostListFilters {
  status?: PostStatus | 'all'
  search?: string
  category?: string
  page?: number
  limit?: number
}

export interface PaginatedSocialPosts {
  items: SocialPost[]
  total: number
  page: number
  limit: number
}

export type SocialMutationResult =
  | { ok: true; post: SocialPost }
  | { ok: false; code: 'NOT_FOUND' | 'VERSION_CONFLICT' | 'SLUG_CONFLICT'; current?: SocialPost }
