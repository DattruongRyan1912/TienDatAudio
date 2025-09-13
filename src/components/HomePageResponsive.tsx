'use client'

import Link from "next/link"
import { ArrowRight, Shield, Truck, Headphones, DollarSign, Star, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ProductCard"
import { getFeaturedProducts, getBestsellerProducts, getCategories, type Product, type Category } from "@/lib/data"
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePageResponsive() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  // const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, , cats] = await Promise.all([
          getFeaturedProducts(),
          getBestsellerProducts(),
          getCategories()
        ])
        setFeaturedProducts(featured.slice(0, 8))
        // setBestsellerProducts(bestseller.slice(0, 6))
        setCategories(cats)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden"
        {...fadeInUp}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/audio-wave.svg')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[700px] py-16 lg:py-24">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center bg-blue-700/50 rounded-full px-4 py-2 mb-6"
              >
                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                <span className="text-sm font-medium">Thương hiệu uy tín #1</span>
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                <span className="block">Thiết Bị Âm Thanh</span>
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Chất Lượng Cao
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Chuyên cung cấp loa, amply, micro và thiết bị âm thanh chuyên nghiệp. 
                Mang đến trải nghiệm âm thanh tuyệt vời cho mọi không gian.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto">
                      Xem sản phẩm
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="border-blue-200 text-blue-100 hover:bg-blue-100 hover:text-blue-900 w-full sm:w-auto">
                      <Play className="mr-2 h-5 w-5" />
                      Liên hệ tư vấn
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">5000+</div>
                  <div className="text-sm text-blue-200">Khách hàng</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">10+</div>
                  <div className="text-sm text-blue-200">Năm kinh nghiệm</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">99%</div>
                  <div className="text-sm text-blue-200">Hài lòng</div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Hero Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="text-6xl lg:text-8xl opacity-50">🎵</div>
                </div>
                
                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="absolute -right-4 lg:-right-8 top-8 bg-white rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Bảo hành</div>
                      <div className="text-xs text-gray-600">Chính hãng</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="absolute -left-4 lg:-left-8 bottom-8 bg-white rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Giao hàng</div>
                      <div className="text-xs text-gray-600">Miễn phí</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-12 lg:py-20 bg-gray-50"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Tiến Đạt Audio?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những sản phẩm chất lượng tốt nhất với dịch vụ hoàn hảo
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Shield,
                title: "Bảo hành chính hãng",
                description: "Tất cả sản phẩm đều có bảo hành chính hãng từ nhà sản xuất",
                color: "bg-blue-500"
              },
              {
                icon: Truck,
                title: "Giao hàng miễn phí",
                description: "Miễn phí giao hàng toàn quốc cho đơn hàng trên 2 triệu",
                color: "bg-green-500"
              },
              {
                icon: Headphones,
                title: "Hỗ trợ 24/7",
                description: "Đội ngũ kỹ thuật hỗ trợ và tư vấn 24/7",
                color: "bg-purple-500"
              },
              {
                icon: DollarSign,
                title: "Giá tốt nhất",
                description: "Cam kết giá tốt nhất thị trường, hoàn tiền nếu có nơi rẻ hơn",
                color: "bg-orange-500"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section 
        className="py-12 lg:py-20"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá bộ sưu tập thiết bị âm thanh đa dạng
            </p>
          </motion.div>
          
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl opacity-50">📻</span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section 
        className="py-12 lg:py-20 bg-gray-50"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Những sản phẩm được khách hàng tin tưởng và lựa chọn nhiều nhất
            </p>
          </motion.div>
          
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  custom={index}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
          
          <motion.div variants={fadeInUp} className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="hover:bg-blue-600 hover:text-white">
                Xem tất cả sản phẩm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            Sẵn sàng nâng cấp hệ thống âm thanh?
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Liên hệ với chúng tôi ngay hôm nay để được tư vấn miễn phí và tìm hiểu về các giải pháp âm thanh phù hợp
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <Link href="/contact">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto">
                Liên hệ ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+84123456789">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-100 hover:bg-blue-100 hover:text-blue-900 w-full sm:w-auto">
                Gọi: 0123.456.789
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
