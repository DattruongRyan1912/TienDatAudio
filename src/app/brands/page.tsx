'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import { getProducts, type Product, type Brand } from '@/lib/data'
import { Search, Star, Award, Users, TrendingUp } from 'lucide-react'

const brandStats = [
  { icon: Award, label: "Thương hiệu", value: "15+", description: "Thương hiệu uy tín" },
  { icon: Star, label: "Đánh giá", value: "4.9/5", description: "Từ khách hàng" },
  { icon: Users, label: "Khách hàng", value: "10K+", description: "Tin tưởng lựa chọn" },
  { icon: TrendingUp, label: "Tăng trưởng", value: "200%", description: "Mỗi năm" }
]

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadAllProducts = useCallback(async () => {
    try {
      const productsData = await getProducts({ 
        search: searchQuery,
        limit: 12 
      })
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }, [searchQuery])

  const loadProductsByBrand = useCallback(async (brandId: string) => {
    try {
      const productsData = await getProducts({ 
        brand: brandId,
        search: searchQuery 
      })
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products by brand:', error)
    }
  }, [searchQuery])

  const loadData = useCallback(async () => {
    try {
      // Load brands from API instead of static data
      const response = await fetch('/api/admin/brands')
      const result = await response.json()
      if (result.success) {
        setBrands(result.data)
      } else {
        console.error('Failed to load brands:', result.message)
      }
      await loadAllProducts()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadAllProducts])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (selectedBrand) {
      loadProductsByBrand(selectedBrand)
    } else {
      loadAllProducts()
    }
  }, [selectedBrand, loadProductsByBrand, loadAllProducts])

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(selectedBrand === brandId ? '' : brandId)
  }

  const getSelectedBrandName = () => {
    if (!selectedBrand) return ''
    const brand = brands.find(b => b.id === selectedBrand)
    return brand ? brand.name : selectedBrand
  }

  const featuredBrands = brands.slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Thương Hiệu Âm Thanh Hàng Đầu
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Khám phá các thương hiệu âm thanh uy tín nhất thế giới, mang đến trải nghiệm âm thanh đỉnh cao
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {brandStats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Brands */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Thương Hiệu Nổi Bật
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Chúng tôi tự hào đại diện cho các thương hiệu âm thanh uy tín nhất thế giới
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                {featuredBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    className={`bg-white rounded-xl p-6 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl ${
                      selectedBrand === brand.id 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleBrandSelect(brand.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <Image 
                          src={brand.logo} 
                          alt={brand.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-700">
                          {brand.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{brand.name}</h3>
                    <p className="text-sm text-gray-600">{brand.country || 'International'}</p>
                    <div className="mt-3 text-xs text-blue-600 font-medium">
                      {brand.productCount || 0} sản phẩm
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* All Brands */}
            {brands.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Tất Cả Thương Hiệu
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {brands.map((brand) => (
                    <motion.button
                      key={brand.id}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedBrand === brand.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleBrandSelect(brand.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {brand.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedBrand ? `Sản phẩm ${getSelectedBrandName()}` : 'Sản phẩm nổi bật'}
              </h2>
              <p className="text-gray-600">
                {selectedBrand 
                  ? `Khám phá các sản phẩm chất lượng cao từ ${getSelectedBrandName()}`
                  : 'Những sản phẩm được yêu thích nhất từ các thương hiệu hàng đầu'
                }
              </p>
            </motion.div>

            {products.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-gray-600 text-lg">
                  {selectedBrand 
                    ? `Không tìm thấy sản phẩm nào từ thương hiệu ${selectedBrand}`
                    : 'Không có sản phẩm nào'
                  }
                </div>
                <p className="text-gray-500 mt-2">
                  Thử chọn thương hiệu khác hoặc thay đổi từ khóa tìm kiếm
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
