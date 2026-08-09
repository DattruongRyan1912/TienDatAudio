import type { MetadataRoute } from 'next'
import { getBusinessProfile } from '@/lib/business-profile'
import { getBrands, getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import { getAllPublicSocialPosts } from '@/modules/social/application/social-post-service'
import { isSocialHubEnabled } from '@/modules/social/domain/feature-flag'

function validDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : new Date(0)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, brands, products, posts, socialPosts] = await Promise.all([getBusinessProfile(), getBrands(), getProducts(), getPublicPosts(500), getAllPublicSocialPosts()])
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: validDate(profile.updatedAt), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/kien-thuc`, lastModified: posts.length ? validDate(posts[0].updatedAt) : new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...(isSocialHubEnabled() ? [{ url: `${baseUrl}/bai-viet`, lastModified: socialPosts.length ? validDate(socialPosts[0].updatedAt) : new Date(), changeFrequency: 'daily' as const, priority: 0.85 }] : []),
    { url: `${baseUrl}/about`, lastModified: validDate(profile.updatedAt), changeFrequency: 'monthly', priority: 0.55 },
    { url: `${baseUrl}/contact`, lastModified: validDate(profile.updatedAt), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${baseUrl}/faq`, lastModified: validDate(profile.updatedAt), changeFrequency: 'monthly', priority: 0.6 },
  ]
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/san-pham/${product.slug}`,
    lastModified: validDate(product.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
    images: product.images.filter(Boolean).map((image) => image.startsWith('http') ? image : `${baseUrl}${image}`),
  }))
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/thuong-hieu/${brand.slug}`,
    lastModified: validDate(brand.updatedAt || ''),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/kien-thuc/${post.slug}`,
    lastModified: validDate(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: [post.featuredImage, ...post.gallery].filter(Boolean).map((image) => image.startsWith('http') ? image : `${baseUrl}${image}`),
  }))
  const socialPages: MetadataRoute.Sitemap = socialPosts.map((post) => ({
    url: `${baseUrl}/bai-viet/${post.slug}`,
    lastModified: validDate(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.75,
    images: [post.seo.ogImage, ...post.media.filter((item) => item.type === 'image').map((item) => item.url)].filter(Boolean),
  }))
  return [...staticPages, ...brandPages, ...productPages, ...articlePages, ...socialPages]
}
