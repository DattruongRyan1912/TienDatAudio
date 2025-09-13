import { notFound } from "next/navigation"
import { getProductBySlug, getRelatedProducts } from "@/lib/data"
import ProductDetail from "@/components/ProductDetail"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return {
      title: "Sản phẩm không tìm thấy",
    }
  }

  return {
    title: `${product.name} - Tiến Đạt Audio`,
    description: product.description,
    keywords: `${product.name}, ${product.brand}, thiết bị âm thanh`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id)

  return (
    <ProductDetail 
      product={product} 
      relatedProducts={relatedProducts}
    />
  )
}
