import { revalidatePath } from 'next/cache'
import type { SocialPost } from '../domain/types'
import { notifyIndexNow } from '@/lib/search-indexing'

export async function refreshPublishedSocialPost(post: SocialPost) {
  const postPath = `/bai-viet/${post.slug}`
  revalidatePath('/')
  revalidatePath('/bai-viet')
  revalidatePath(postPath)
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
  revalidatePath('/llms.txt')
  await notifyIndexNow([postPath, '/bai-viet', '/', '/sitemap.xml', '/feed.xml'])
}
