import { revalidatePath } from 'next/cache'
import type { ContentPost } from './content-types'
import { notifyIndexNow } from './search-indexing'

export async function refreshPublishedContent(post: ContentPost) {
  const articlePath = `/kien-thuc/${post.slug}`
  revalidatePath('/kien-thuc')
  revalidatePath(articlePath)
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
  revalidatePath('/llms.txt')
  await notifyIndexNow([articlePath, '/kien-thuc', '/sitemap.xml', '/feed.xml'])
}
