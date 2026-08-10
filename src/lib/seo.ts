import { Metadata } from 'next'
import { type Product, type Category, type Brand, type ProductSEO } from '@/lib/data'
import { getSEODataForPage, type SEOContent } from '@/lib/seo-static'

export const defaultSiteUrl = 'https://tiendataudioquangngai.id.vn'
export const defaultOpenGraphImage = '/images/og-default.jpg'

const siteConfig = {
  name: 'Tiến Đạt Audio',
  description: 'Chuyên cung cấp thiết bị âm thanh chất lượng cao - Loa, Ampli, Phụ kiện âm thanh chính hãng với giá tốt nhất',
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  ogImage: defaultOpenGraphImage,
  keywords: [
    'thiết bị âm thanh',
    'loa chính hãng', 
    'ampli cao cấp',
    'phụ kiện âm thanh',
    'Sony audio',
    'Yamaha audio',
    'Denon audio',
    'Marantz audio',
    'hifi audio',
    'home theater',
    'âm thanh chất lượng cao',
    'thiết bị nghe nhạc'
  ],
  authors: [
    {
      name: 'Tiến Đạt Audio',
      url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
    }
  ],
  creator: 'Tiến Đạt Audio Team',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl),
}

export function generateSEOMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  keywords,
  pagePath,
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  keywords?: string[]
  pagePath?: string
}): Metadata {
  let seoData: SEOContent | null = null
  if (pagePath) {
    seoData = getSEODataForPage(pagePath)
  }

  // Explicit page values are the source of truth. The static SEO registry is
  // only a fallback, so an older generated record cannot override a route.
  const seoTitle = title || seoData?.title || siteConfig.name
  const seoDescription = description || seoData?.description || siteConfig.description
  const seoKeywords = keywords || seoData?.keywords || siteConfig.keywords
  const seoImage = image || seoData?.ogImage || siteConfig.ogImage
  const pageUrl = pagePath ? absoluteSiteUrl(pagePath) : siteConfig.url
  const seoUrl = absoluteSiteUrl(url || seoData?.canonicalUrl || pageUrl)
  const absoluteImage = absoluteSiteUrl(seoImage)
  const seoOgTitle = seoData?.ogTitle && !title ? seoData.ogTitle : seoTitle
  const seoOgDescription = seoData?.ogDescription && !description ? seoData.ogDescription : seoDescription

  const robotsMeta = seoData?.metaRobots || 'index,follow'
  const isNoIndex = robotsMeta.includes('noindex') || noIndex
  const isNoFollow = robotsMeta.includes('nofollow')

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    metadataBase: siteConfig.metadataBase,
    alternates: {
      canonical: seoUrl,
    },
    openGraph: {
      type,
      locale: 'vi_VN',
      url: seoUrl,
      title: seoOgTitle,
      description: seoOgDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: seoOgTitle,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoOgTitle,
      description: seoOgDescription,
      images: [absoluteImage],
      creator: '@tiendataudio',
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function absoluteSiteUrl(value = '/') {
  try {
    return new URL(value, `${siteConfig.url.replace(/\/$/, '')}/`).toString()
  } catch {
    return siteConfig.url
  }
}

export function getProductCanonicalPath(product: Product) {
  const configured = product.seo?.canonicalUrl?.trim()
  if (!configured) return `/san-pham/${product.slug}`

  try {
    const parsed = new URL(configured, `${siteConfig.url.replace(/\/$/, '')}/`)
    if (parsed.pathname.startsWith('/product/')) {
      parsed.pathname = parsed.pathname.replace(/^\/product\//, '/san-pham/')
    }
    return configured.startsWith('http://') || configured.startsWith('https://')
      ? parsed.toString()
      : `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return `/san-pham/${product.slug}`
  }
}

export function generateProductStructuredData(product: Product, category?: Category, brand?: Brand) {
  const customSchema = product.seo?.schemaMarkup as unknown
  if (customSchema) {
    if (typeof customSchema === 'string') {
      try {
        return JSON.parse(customSchema) as Record<string, unknown>
      } catch {
        // Fall back to the verified schema below when admin JSON is invalid.
      }
    } else if (typeof customSchema === 'object' && !Array.isArray(customSchema)) {
      return customSchema as Record<string, unknown>
    }
  }

  const canonicalUrl = absoluteSiteUrl(getProductCanonicalPath(product))
  const price = Number(product.salePrice || product.price)
  const images = product.images.filter(Boolean).map(absoluteSiteUrl)
  const productNode: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    url: canonicalUrl,
    name: product.name,
    description: product.description,
    image: images,
    sku: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: brand?.name || product.brand || siteConfig.name,
      ...(brand?.logo ? { logo: absoluteSiteUrl(brand.logo) } : {}),
    },
    category: category?.name || product.category || 'Thiết bị âm thanh',
  }

  if (Number.isFinite(price) && price > 0) {
    productNode.offers = {
      '@type': 'Offer',
      url: canonicalUrl,
      price: String(price),
      priceCurrency: 'VND',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        '@id': `${siteConfig.url.replace(/\/$/, '')}#business`,
        name: siteConfig.name,
        url: siteConfig.url,
      },
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      productNode,
      {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: siteConfig.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sản phẩm',
          item: absoluteSiteUrl('/products'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: canonicalUrl,
        },
      ],
      },
    ],
  }
}

// Utility functions for SEO management
export function generateProductSEODefaults(product: Product, category?: Category, brand?: Brand): ProductSEO {
  const price = Number(product.salePrice || product.price)
  const priceCopy = price > 0 ? `Giá tham khảo ${price.toLocaleString('vi-VN')}đ.` : 'Liên hệ để nhận báo giá theo thời điểm.'
  return {
    metaTitle: `${product.name} - ${brand?.name || 'Tiến Đạt Audio'} | Chính hãng, giá tốt`,
    metaDescription: `${product.name} tại Tiến Đạt Audio. ${product.description.substring(0, 105)} ${priceCopy} Chính hãng, bảo hành và tư vấn phối ghép.`,
    keywords: [
      product.name.toLowerCase(),
      brand?.name.toLowerCase() || '',
      category?.name.toLowerCase() || '',
      'audio',
      'thiết bị âm thanh',
      'chính hãng',
      'giá tốt'
    ].filter(Boolean),
    ogTitle: `${product.name} - Tiến Đạt Audio`,
    ogDescription: `Mua ${product.name} chính hãng tại Tiến Đạt Audio với giá tốt nhất`,
    ogImage: product.images[0] || defaultOpenGraphImage,
    canonicalUrl: `/san-pham/${product.slug}`,
    noIndex: false,
    schemaMarkup: generateProductStructuredData(product, category, brand)
  };
}

export function validateProductSEO(seo: ProductSEO): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Meta Title validation
  if (!seo.metaTitle || seo.metaTitle.length < 10) {
    errors.push('Meta title phải có ít nhất 10 ký tự');
  } else if (seo.metaTitle.length > 60) {
    errors.push('Meta title không nên vượt quá 60 ký tự');
  } else if (seo.metaTitle.length > 55) {
    warnings.push('Meta title gần đạt giới hạn, nên rút ngắn để tránh bị cắt');
  }
  
  // Meta Description validation - Linh hoạt hơn
  if (!seo.metaDescription || seo.metaDescription.length < 50) {
    errors.push('Meta description phải có ít nhất 50 ký tự');
  } else if (seo.metaDescription.length > 160) {
    errors.push('Meta description không nên vượt quá 160 ký tự');
  } else if (seo.metaDescription.length < 120) {
    warnings.push('Meta description nên dài 120-160 ký tự để tối ưu SEO');
  } else if (seo.metaDescription.length > 155) {
    warnings.push('Meta description gần đạt giới hạn, có thể bị cắt trên Google');
  }
  
  // Keywords validation
  if (!seo.keywords || seo.keywords.length === 0) {
    errors.push('Phải có ít nhất 1 từ khóa');
  } else if (seo.keywords.length > 10) {
    warnings.push('Không nên có quá 10 từ khóa');
  }
  
  // OpenGraph validation
  if (seo.ogTitle && seo.ogTitle.length > 40) {
    warnings.push('OG Title nên ngắn hơn 40 ký tự để hiển thị tốt trên social media');
  }
  
  if (seo.ogDescription && seo.ogDescription.length > 300) {
    warnings.push('OG Description nên ngắn hơn 300 ký tự');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
