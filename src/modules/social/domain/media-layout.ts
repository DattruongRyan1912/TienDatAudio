import type { SocialMediaItem } from './types'

export type SocialMediaLayout = 'empty' | 'single' | 'split' | 'featured-stack' | 'grid' | 'overflow-grid'

export function getSocialMediaLayout(media: SocialMediaItem[]): SocialMediaLayout {
  if (media.length === 0) return 'empty'
  if (media.length === 1) return 'single'
  if (media.length === 2) return 'split'
  if (media.length === 3) return 'featured-stack'
  if (media.length === 4) return 'grid'
  return 'overflow-grid'
}
