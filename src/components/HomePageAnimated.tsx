'use client'

import Link from "next/link"
import { ArrowRight, Shield, Truck, Headphones, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ProductCard"
import { getFeaturedProducts, getBestsellerProducts, getCategories, type Product, type Category } from "@/lib/data"
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, bestseller, cats] = await Promise.all([
          getFeaturedProducts(),
          getBestsellerProducts(),
          getCategories()
        ])
        setFeaturedProducts(featured)
        setBestsellerProducts(bestseller)
        setCategories(cats)
      } catch (error) {
        console.error('Error loading data:', error)
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
        className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white"
        {...fadeInUp}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl mb-6">
                Thiết Bị Âm Thanh
                <span className="block text-primary">Chất Lượng Cao</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Chuyên cung cấp loa, amply, micro và thiết bị âm thanh chuyên nghiệp. 
                Mang đến trải nghiệm âm thanh tuyệt vời cho mọi không gian.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/san-pham">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                      Xem sản phẩm
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/lien-he">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                      Liên hệ tư vấn
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <svg
                className="w-96 h-96"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="50" y="100" width="300" height="200" rx="20" fill="#3B82F6" />
                <rect x="70" y="120" width="260" height="160" rx="10" fill="#1E40AF" />
                <circle cx="200" cy="200" r="60" fill="#60A5FA" />
                <circle cx="200" cy="200" r="30" fill="#DBEAFE" />
                <rect x="100" y="320" width="200" height="30" rx="15" fill="#374151" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tại sao chọn Tiến Đạt Audio?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Chúng tôi cam kết mang đến cho bạn những sản phẩm và dịch vụ tốt nhất
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Chất lượng đảm bảo",
                description: "Sản phẩm chính hãng với chế độ bảo hành tốt nhất"
              },
              {
                icon: Truck,
                title: "Giao hàng nhanh",
                description: "Giao hàng toàn quốc trong 24-48h"
              },
              {
                icon: Headphones,
                title: "Tư vấn chuyên nghiệp",
                description: "Đội ngũ kỹ thuật giàu kinh nghiệm hỗ trợ 24/7"
              },
              {
                icon: DollarSign,
                title: "Giá cả hợp lý",
                description: "Giá tốt nhất thị trường với nhiều ưu đãi hấp dẫn"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section 
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá bộ sưu tập thiết bị âm thanh đa dạng của chúng tôi
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/san-pham?category=${category.slug}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div dangerouslySetInnerHTML={{ __html: category.image }} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>
                      <span className="text-primary font-medium hover:underline">
                        Xem tất cả →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section 
        className="py-16 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Những sản phẩm được yêu thích nhất tại Tiến Đạt Audio
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div 
            className="text-center mt-12"
            {...fadeInUp}
          >
            <Link href="/san-pham">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline">
                  Xem tất cả sản phẩm
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Bestseller Section */}
      <motion.section 
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Sản phẩm bán chạy
            </h2>
            <p className="text-lg text-gray-600">
              Những lựa chọn hàng đầu của khách hàng
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {bestsellerProducts.map((product) => (
              <motion.div 
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
