import { revalidatePath } from 'next/cache'
import { notifyIndexNow } from './search-indexing'

const catalogPaths = ['/', '/products', '/brands', '/sitemap.xml', '/llms.txt']

function uniquePaths(paths: string[]) {
  return Array.from(new Set(paths.filter(Boolean)))
}

/**
 * Refreshes every public discovery surface affected by a catalog mutation.
 * IndexNow is optional; Google still discovers the same URLs through sitemap
 * and internal links when INDEXNOW_KEY is not configured.
 */
export async function refreshCatalogDiscovery(paths: string[] = []) {
  const changedPaths = uniquePaths([...catalogPaths, ...paths])
  revalidatePath('/', 'layout')
  changedPaths.forEach((path) => revalidatePath(path))
  await notifyIndexNow(changedPaths)
}

export async function refreshProductDiscovery(slug: string, previousSlug = '') {
  const productPaths = [
    slug ? `/san-pham/${slug}` : '',
    previousSlug && previousSlug !== slug ? `/san-pham/${previousSlug}` : '',
  ]
  await refreshCatalogDiscovery(productPaths)
}

export async function refreshBrandDiscovery(slug: string, previousSlug = '') {
  const brandPaths = [
    slug ? `/thuong-hieu/${slug}` : '',
    previousSlug && previousSlug !== slug ? `/thuong-hieu/${previousSlug}` : '',
  ]
  await refreshCatalogDiscovery(brandPaths)
}
