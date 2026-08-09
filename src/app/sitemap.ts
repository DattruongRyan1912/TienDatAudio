import type { MetadataRoute } from 'next'
import { getBusinessProfile } from '@/lib/business-profile'
import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'

function validDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : new Date(0)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, products, posts] = await Promise.all([getBusinessProfile(), getProducts(), getPublicPosts(500)])
  const baseUrl = profile.siteUrl.replace(/\/$/, '')
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: validDate(profile.updatedAt), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/kien-thuc`, lastModified: posts.length ? validDate(posts[0].updatedAt) : new Date(), changeFrequency: 'weekly', priority: 0.8 },
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
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/kien-thuc/${post.slug}`,
    lastModified: validDate(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: [post.featuredImage, ...post.gallery].filter(Boolean).map((image) => image.startsWith('http') ? image : `${baseUrl}${image}`),
  }))
  return [...staticPages, ...productPages, ...articlePages]
}
