import Image from "next/image"
import Link from "next/link"
import { Star, Eye, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, calculateSalePercentage } from "@/lib/utils"
import type { Product } from "@/lib/data"

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const currentPrice = product.salePrice || product.price
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercentage = hasDiscount 
    ? calculateSalePercentage(product.price, product.salePrice!)
    : 0

  return (
    <div className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.bestseller && (
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
            Best Seller
          </span>
        )}
        {product.featured && (
          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
            Nổi bật
          </span>
        )}
        {hasDiscount && (
          <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Stock status */}
      {!product.inStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded">
            Hết hàng
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        <Link href={`/san-pham/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </Link>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/san-pham/${product.slug}`}>
                <Eye className="h-4 w-4 mr-1" />
                Xem
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          <Link 
            href={`/san-pham/${product.slug}`}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-xs text-red-500 font-medium">
              Hết hàng
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1"
            disabled={!product.inStock}
            asChild
          >
            <Link href={`/san-pham/${product.slug}`}>
              Xem chi tiết
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
