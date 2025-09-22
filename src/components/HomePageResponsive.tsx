'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Truck, Headphones, DollarSign, Star, Play, Calendar, Clock, Eye, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ProductCard"
import { getFeaturedProducts, getBestsellerProducts, getCategories, getFeaturedBlogPosts, getFeaturedCombos, type Product, type Category, type BlogPost, type Combo } from "@/lib/data"
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePageResponsive() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [combos, setCombos] = useState<Combo[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Starting to load data...')
                const [featured, , cats, posts, featuredCombos] = await Promise.all([
                    getFeaturedProducts(),
                    getBestsellerProducts(),
                    getCategories(),
                    getFeaturedBlogPosts(3),
                    getFeaturedCombos(3)
                ])
                console.log('Raw data loaded:', {
                    featured,
                    cats,
                    posts,
                    featuredCombos
                })
                setFeaturedProducts(featured.slice(0, 8))
                setCategories(cats)
                setBlogPosts(posts)
                setCombos(featuredCombos)
                console.log('Data loaded:', {
                    featuredProducts: featured.length,
                    categories: cats.length,
                    blogPosts: posts.length,
                    combos: featuredCombos.length
                })
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setIsLoading(false)
                console.log('Loading finished, isLoading set to false')
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
            {/* Hero Section with Banner Background */}
            <motion.section
                className="relative h-[600px] lg:h-[700px] overflow-hidden bg-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/banner.jpg"
                        alt="Tiến Đạt Audio Banner"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-center lg:justify-start min-h-[600px] lg:min-h-[700px] py-16 lg:py-24">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-center lg:text-left max-w-2xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8"
                            >
                                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                                <span className="text-sm font-semibold text-white">Thương hiệu uy tín #1 Quảng Ngãi</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-8"
                            >
                                <span className="block text-white drop-shadow-2xl">Thiết Bị Âm Thanh</span>
                                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                                    Chuyên Nghiệp
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed font-medium drop-shadow-lg"
                            >
                                Hotline: <span className="text-yellow-400 font-bold">0934995657</span>
                                <br />
                                <span className="text-lg">Sửa chữa • Trao đổi • Nâng cấp thiết bị âm thanh chống hú</span>
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
                            >
                                <Link href="/products">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 text-lg shadow-2xl">
                                            Xem sản phẩm
                                            <ArrowRight className="ml-2 h-6 w-6" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/contact">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-4 text-lg shadow-2xl">
                                            <Play className="mr-2 h-6 w-6" />
                                            Liên hệ ngay
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                className="grid grid-cols-3 gap-6 mt-12 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.0 }}
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl sm:text-4xl font-bold text-yellow-400">5000+</div>
                                    <div className="text-sm text-white/80 font-medium">Khách hàng tin tưởng</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl sm:text-4xl font-bold text-yellow-400">10+</div>
                                    <div className="text-sm text-white/80 font-medium">Năm kinh nghiệm</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl sm:text-4xl font-bold text-yellow-400">99%</div>
                                    <div className="text-sm text-white/80 font-medium">Hài lòng</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Featured Products Section */}
            <motion.section
                className="py-12 lg:py-20 bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" variants={fadeInUp}>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Sản phẩm nổi bật
                        </h2>
                        <p className="text-lg text-gray-600">
                            Những sản phẩm thiết bị âm thanh được khách hàng yêu thích nhất
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
                            ))
                        ) : featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <motion.div key={product.id} variants={fadeInUp}>
                                    <ProductCard product={product} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-8 text-gray-600">
                                Không có sản phẩm nổi bật
                            </div>
                        )}
                    </div>

                    <motion.div className="text-center mt-12" variants={fadeInUp}>
                        <Link href="/products">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Xem tất cả sản phẩm
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Blog Section */}
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
                            Blog thiết bị âm thanh
                        </h2>
                        <p className="text-lg text-gray-600">
                            Cập nhật tin tức mới nhất và hướng dẫn chuyên nghiệp về thiết bị âm thanh
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
                            ))
                        ) : blogPosts.length > 0 ? (
                            blogPosts.map((post) => (
                                <motion.div key={post.id} variants={fadeInUp}>
                                    <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        {post.featuredImage && (
                                            <div className="aspect-video relative overflow-hidden">
                                                <Image
                                                    src={post.featuredImage}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                {post.readingTime && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{post.readingTime} phút đọc</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>

                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                            >
                                                Đọc thêm
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </article>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-gray-600">
                                Không có bài viết
                            </div>
                        )}
                    </div>                    <motion.div className="text-center mt-12" variants={fadeInUp}>
                        <Link href="/blog">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Xem tất cả bài viết
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
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
                            Tại sao chọn thiết bị âm thanh tại Tiến Đạt Audio?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Chuyên cung cấp thiết bị âm thanh chính hãng tại khu vực Quảng Ngãi với chất lượng và dịch vụ tốt nhất
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Bảo hành chính hãng",
                                description: "Tất cả thiết bị âm thanh đều có bảo hành chính hãng từ nhà sản xuất",
                                color: "bg-blue-500"
                            },
                            {
                                icon: Truck,
                                title: "Giao hàng Quảng Ngãi",
                                description: "Miễn phí giao hàng khu vực Quảng Ngãi cho đơn hàng trên 2 triệu",
                                color: "bg-green-500"
                            },
                            {
                                icon: Headphones,
                                title: "Hỗ trợ thiết bị âm thanh",
                                description: "Đội ngũ kỹ thuật hỗ trợ và tư vấn thiết bị âm thanh 24/7",
                                color: "bg-purple-500"
                            },
                            {
                                icon: DollarSign,
                                title: "Giá tốt nhất Quảng Ngãi",
                                description: "Cam kết giá thiết bị âm thanh tốt nhất khu vực, hoàn tiền nếu có nơi rẻ hơn",
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

            {/* Combo Reels Section */}
            <motion.section
                className="py-12 lg:py-20 bg-gradient-to-r from-purple-50 to-pink-50"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, margin: "-100px" }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" variants={fadeInUp}>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Combo Reel Sản Phẩm 🎥
                        </h2>
                        <p className="text-lg text-gray-600">
                            Khám phá combo sản phẩm qua video và hình ảnh sống động
                        </p>
                    </motion.div>

                    {!isLoading && combos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {combos.map((combo) => (
                                <motion.div
                                    key={combo.id}
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02 }}
                                    className="group"
                                >
                                    <Link href={`/combos/${combo.slug}`}>
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-[9/16] sm:aspect-[4/3] lg:aspect-[9/16] overflow-hidden">
                                                <Image
                                                    src={combo.thumbnail}
                                                    alt={combo.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* Type indicator */}
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                                                        {combo.type === 'video' ? (
                                                            <Play className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <div className="flex gap-1">
                                                                {[1,2,3].map((i) => (
                                                                    <div key={i} className="w-1 h-1 bg-white rounded-full opacity-80" />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Price overlay */}
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-2 text-white">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs opacity-80 line-through">
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(combo.originalPrice || 0)}
                                                                </p>
                                                                <p className="font-bold text-sm">
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(combo.comboPrice || 0)}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white/20 rounded-full px-2 py-1">
                                                                <span className="text-xs font-bold">-{combo.savingsPercent}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                    {combo.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {combo.description}
                                                </p>
                                                
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {combo.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                
                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        <span>{combo.views.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3" />
                                                        <span>{combo.likes.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-gray-200 animate-pulse rounded-2xl aspect-[9/16] sm:aspect-[4/3] lg:aspect-[9/16]"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-gray-600 mb-4">Chưa có combo reel nào</p>
                            <p className="text-sm text-gray-500">Chúng tôi đang chuẩn bị các combo sản phẩm hấp dẫn</p>
                        </div>
                    )}

                    <motion.div className="text-center mt-12" variants={fadeInUp}>
                        <Link href="/combos">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-3">
                                🎥 Xem tất cả combo reel
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
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
                            Danh mục thiết bị âm thanh
                        </h2>
                        <p className="text-lg text-gray-600">
                            Khám phá bộ sưu tập thiết bị âm thanh chính hãng tại Quảng Ngãi
                        </p>
                    </motion.div>

                    {!isLoading && categories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {categories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02 }}
                                    className="group"
                                >
                                    <Link href={`/san-pham?category=${category.slug}`}>
                                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                            {category.image ? (
                                                <div className="aspect-[4/3] relative overflow-hidden">
                                                    <Image
                                                        src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/uploads/${category.image}`}
                                                        alt={category.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <span className="text-4xl opacity-50">📻</span>
                                                </div>
                                            )}
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
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-600">
                            Không có danh mục nào
                        </div>
                    )}
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
                        Sẵn sàng nâng cấp thiết bị âm thanh tại Quảng Ngãi?
                    </motion.h2>
                    <motion.p
                        className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
                        variants={fadeInUp}
                    >
                        Liên hệ với Tiến Đạt Audio ngay hôm nay để được tư vấn miễn phí về thiết bị âm thanh chính hãng tại khu vực Quảng Ngãi
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
                        <Link href="tel:+84334995657">
                            <Button size="lg" variant="outline" className="border-blue-200 text-blue-100 hover:bg-blue-100 hover:text-blue-900 w-full sm:w-auto">
                                Gọi: 0934.995.657
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    )
}
