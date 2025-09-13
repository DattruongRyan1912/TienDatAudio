'use client'

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import type { Product } from "@/lib/data"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const currentPrice = product.salePrice || product.price
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden group">
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            {product.images && product.images[0] ? (
              <Image 
                src={product.images[0]} 
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </motion.div>
          
          {/* Overlay buttons */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                <Heart className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Nổi bật
                </span>
              </motion.div>
            )}
            {product.bestseller && (
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Bán chạy
                </span>
              </motion.div>
            )}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  -{discountPercentage}%
                </span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="border border-gray-300 px-2 py-1 rounded text-xs">
                {product.brand}
              </span>
              <span className="border border-gray-300 px-2 py-1 rounded text-xs">
                {product.category}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 text-gray-900">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-600 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600">(4.5)</span>
              </div>
            </div>
            
            {product.inStock ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Còn hàng
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                Hết hàng
              </span>
            )}
          </motion.div>
        </div>

        <div className="p-4 pt-0">
          <Link href={`/san-pham/${product.slug}`} className="w-full block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transform transition-all duration-300"
                disabled={!product.inStock}
              >
                {product.inStock ? 'Xem chi tiết' : 'Hết hàng'}
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
