import { Metadata } from 'next'
import { getProducts } from '@/lib/data'
import ProductPageClient from './ProductPageClient'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  try {
    const products = await getProducts()
    const product = products.find(p => p.slug === resolvedParams.slug)
    
    if (!product) {
      return {
        title: 'Sản phẩm không tìm thấy | Tiến Đạt Audio',
        description: 'Sản phẩm bạn đang tìm kiếm không tồn tại'
      }
    }

    const price = product.salePrice || product.price
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)

    return {
      title: `${product.name} - ${product.brand || 'N/A'} | Tiến Đạt Audio`,
      description: `${product.name} ${product.brand || ''} giá ${formattedPrice}. ${product.description}. Miễn phí vận chuyển, bảo hành chính hãng tại Tiến Đạt Audio.`,
      keywords: [
        product.name,
        product.brand || '',
        product.category || '',
        'thiết bị âm thanh',
        'chính hãng',
        'giá tốt'
      ].filter(Boolean), // Remove empty strings
      openGraph: {
        title: `${product.name} - ${product.brand || 'N/A'}`,
        description: `${product.name} ${product.brand || ''} giá ${formattedPrice}`,
        images: product.images?.[0] ? [
          {
            url: product.images[0],
            width: 800,
            height: 600,
            alt: product.name
          }
        ] : [],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand}`,
        description: `${product.name} ${product.brand} giá ${formattedPrice}`,
        images: product.images?.[0] ? [product.images[0]] : []
      },
      alternates: {
        canonical: `/product/${product.slug}`
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Sản phẩm | Tiến Đạt Audio',
      description: 'Khám phá các sản phẩm âm thanh chất lượng cao tại Tiến Đạt Audio'
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  return <ProductPageClient params={resolvedParams} />
}
