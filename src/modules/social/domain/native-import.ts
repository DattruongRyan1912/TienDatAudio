import type { SocialLinkImportPreview, SocialLinkImportedAsset } from './link-preview'
import { buildImportedSocialSlug } from './slug'
import type { SocialPost } from './types'

function stableLinkImage(currentImage: string, sourceImage: string, importedImage: string) {
  if (!currentImage || currentImage === sourceImage) return importedImage
  return currentImage
}

export function applyNativeSocialGalleryImport(post: SocialPost, preview: SocialLinkImportPreview, assets: SocialLinkImportedAsset[] = []): SocialPost {
  const fallbackDescription = preview.description || `Liên kết public từ ${preview.domain}.`
  const uniqueAssets = assets.filter((asset, index, all) => asset.url && all.findIndex((candidate) => (candidate.publicId && candidate.publicId === asset.publicId) || candidate.url === asset.url) === index)
  const imageUrl = uniqueAssets[0]?.url || preview.imageUrl
  const link = {
    url: preview.sourceUrl,
    domain: preview.domain,
    title: preview.title,
    description: preview.description,
    imageUrl,
  }
  const importedMedia = uniqueAssets.map((asset, index) => ({
    id: `media-${crypto.randomUUID()}`,
    type: 'image' as const,
    url: asset.url,
    thumbnailUrl: asset.url,
    publicId: asset.publicId,
    width: asset.width,
    height: asset.height,
    aspectRatio: asset.width && asset.height ? asset.width / asset.height : null,
    alt: asset.alt || preview.title || 'Hình ảnh trong bài viết',
    order: post.media.length + index,
  }))
  const media = [...post.media, ...importedMedia.filter((asset) => !post.media.some((item) => item.publicId === asset.publicId || item.url === asset.url))].slice(0, 50)
  const title = post.title.trim() || preview.title
  const slug = buildImportedSocialSlug(post.slug, post.title, title, preview.sourceUrl)

  return {
    ...post,
    postType: 'native',
    title,
    slug,
    excerpt: post.excerpt.trim() || fallbackDescription,
    text: post.text.trim() || preview.description || `Xem nội dung tại ${preview.sourceUrl}`,
    media,
    links: post.links.some((item) => item.url === link.url)
      ? post.links.map((item) => item.url === link.url ? { ...item, ...link } : item)
      : [...post.links, link],
    facebookSourceUrl: preview.kind === 'facebook' ? preview.sourceUrl : '',
    facebookEmbedUrl: '',
    seo: {
      ...post.seo,
      metaTitle: post.seo.metaTitle.trim() || preview.title,
      metaDescription: post.seo.metaDescription.trim() || fallbackDescription,
      ogTitle: post.seo.ogTitle.trim() || preview.title,
      ogDescription: post.seo.ogDescription.trim() || fallbackDescription,
      ogImage: stableLinkImage(post.seo.ogImage, preview.imageUrl, imageUrl),
      canonicalPath: post.seo.canonicalPath || `/bai-viet/${slug}`,
    },
  }
}

export function applyNativeSocialLinkImport(post: SocialPost, preview: SocialLinkImportPreview, asset?: SocialLinkImportedAsset): SocialPost {
  return applyNativeSocialGalleryImport(post, preview, asset ? [asset] : [])
}
