'use client'

import { useEffect, useState, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Truck, Shield, Check, Headphones } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getProducts, type Product } from '@/lib/data'
import ContactWidget from '@/components/ContactWidget'

interface ProductPageClientProps {
  params: {
    slug: string
  }
}

export default function ProductPageClient({ params }: ProductPageClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  const loadProduct = useCallback(async () => {
    try {
      const products = await getProducts()
      const foundProduct = products.find(p => p.slug === params.slug)
      
      if (!foundProduct) {
        notFound()
        return
      }
      
      setProduct(foundProduct)
    } catch (error) {
      console.error('Error loading product:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }, [params.slug])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link></li>
              <li className="before:content-['/'] before:mx-2">
                <Link href="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
              </li>
              <li className="before:content-['/'] before:mx-2">{product.category}</li>
              <li className="before:content-['/'] before:mx-2 text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white rounded-2xl border overflow-hidden shadow-lg">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-blue-600 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ảnh ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">4.8</span>
                <span>•</span>
                <span>125 đánh giá</span>
                <span>•</span>
                <span className="text-green-600 font-medium">Đã bán 250+</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
              <div className="space-y-3">
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-red-600">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                        -{calculateDiscount(product.price, product.salePrice)}%
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-700 font-medium">✓ Giá đã bao gồm VAT</span>
                  <span className="text-blue-700 font-medium">✓ Miễn phí vận chuyển</span>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-6">
              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Còn hàng</span>
              </div>

              {/* Contact Widget */}
              <ContactWidget productName={product.name} />
              
              {/* Product Benefits */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                  🎯 Ưu đãi đặc biệt khi mua tại Tiến Đạt Audio
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Bảo hành chính hãng {product.brand}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Miễn phí giao hàng khu vực Quảng Ngãi</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Hỗ trợ kỹ thuật trọn đời</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Tư vấn miễn phí 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chính sách bán hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                  <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-900">Giao hàng nhanh</div>
                    <div className="text-sm text-green-700">Miễn phí Quảng Ngãi</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900">Bảo hành chính hãng</div>
                    <div className="text-sm text-blue-700">Uy tín - Chất lượng</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                  <Headphones className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-purple-900">Hỗ trợ 24/7</div>
                    <div className="text-sm text-purple-700">Tư vấn chuyên nghiệp</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                Mô tả sản phẩm
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
                  Tính năng nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
                Thông số kỹ thuật
              </h2>
              <div className="space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                    <dt className="text-gray-600 font-medium capitalize">{key}:</dt>
                    <dd className="text-gray-900 font-semibold text-right max-w-[60%]">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
