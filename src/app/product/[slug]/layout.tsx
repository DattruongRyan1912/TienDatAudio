import { getProductBySlug } from '@/lib/data'
import { generateProductSEO } from '@/lib/seo'

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug)
    if (!product) {
      return {
        title: 'Sản phẩm không tìm thấy | Tiến Đạt Audio',
        description: 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.'
      }
    }
    
    return generateProductSEO(product)
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Lỗi | Tiến Đạt Audio',
      description: 'Có lỗi xảy ra khi tải thông tin sản phẩm.'
    }
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>
}
