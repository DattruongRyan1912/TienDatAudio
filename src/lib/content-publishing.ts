import { revalidatePath } from 'next/cache'
import type { ContentPost } from './content-types'
import { notifyIndexNow } from './search-indexing'
import { rebuildArticleChunks } from '@/modules/knowledge/infrastructure/knowledge-repository'

export async function refreshPublishedContent(post: ContentPost) {
  const articlePath = `/kien-thuc/${post.slug}`
  try {
    await rebuildArticleChunks(post)
  } catch (error) {
    console.warn('[knowledge] article chunk refresh degraded', error instanceof Error ? error.message : 'unknown')
  }
  revalidatePath('/kien-thuc')
  revalidatePath(articlePath)
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
  revalidatePath('/llms.txt')
  await notifyIndexNow([articlePath, '/kien-thuc', '/sitemap.xml', '/feed.xml'])
}
