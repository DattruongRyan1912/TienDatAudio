import { Metadata } from 'next'
import { type Product, type Category, type Brand, type ProductSEO } from '@/lib/data'
import { getSEODataForPage, type SEOContent } from '@/lib/seo-static'

const defaultSiteUrl = 'https://tiendataudioquangngai.id.vn'

const siteConfig = {
  name: 'Tiến Đạt Audio',
  description: 'Chuyên cung cấp thiết bị âm thanh chất lượng cao - Loa, Ampli, Phụ kiện âm thanh chính hãng với giá tốt nhất',
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  ogImage: '/images/og-image.jpg',
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
  // Try to get SEO data from database first
  let seoData: SEOContent | null = null
  if (pagePath) {
    seoData = getSEODataForPage(pagePath)
  }
  
  // Use SEO data from database if available, otherwise use fallback
  const seoTitle = seoData?.title || title || siteConfig.name;
  const seoDescription = seoData?.description || description || siteConfig.description;
  const seoKeywords = seoData?.keywords || keywords || siteConfig.keywords;
  const seoImage = seoData?.ogImage || image || siteConfig.ogImage;
  const seoUrl = seoData?.canonicalUrl || url || siteConfig.url;
  const seoOgTitle = seoData?.ogTitle || seoTitle;
  const seoOgDescription = seoData?.ogDescription || seoDescription;
  
  // Parse robots meta from seoData
  const robotsMeta = seoData?.metaRobots || 'index,follow';
  const isNoIndex = robotsMeta.includes('noindex') || noIndex;
  const isNoFollow = robotsMeta.includes('nofollow');

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
          url: seoImage,
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
      images: [seoImage],
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

function generateProductStructuredData(product: Product, category?: Category, brand?: Brand) {
  const price = product.salePrice || product.price
  
  // Use custom schema markup if provided
  if (product.seo?.schemaMarkup) {
    return typeof product.seo.schemaMarkup === 'string' 
      ? JSON.parse(product.seo.schemaMarkup)
      : product.seo.schemaMarkup;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: brand?.name || product.brand,
      logo: brand?.logo
    },
    category: category?.name || product.category,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'VND',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: siteConfig.url
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category?.name || 'Sản phẩm',
          item: `${siteConfig.url}/products?category=${category?.slug || ''}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: `${siteConfig.url}/product/${product.slug}`
        }
      ]
    }
  }
}

// Utility functions for SEO management
export function generateProductSEODefaults(product: Product, category?: Category, brand?: Brand): ProductSEO {
  return {
    metaTitle: `${product.name} - ${brand?.name || 'Tiến Đạt Audio'} | Chính hãng, giá tốt`,
    metaDescription: `${product.name} tại Tiến Đạt Audio. ${product.description.substring(0, 120)}... ✓ Chính hãng ✓ Bảo hành ✓ Giao hàng toàn quốc. Giá từ ${product.price.toLocaleString('vi-VN')}đ`,
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
    ogImage: product.images[0] || '/images/default-product.jpg',
    canonicalUrl: `/product/${product.slug}`,
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
