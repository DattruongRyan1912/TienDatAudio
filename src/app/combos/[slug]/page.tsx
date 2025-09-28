'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
    ArrowLeft, 
    Heart, 
    Share2, 
    ShoppingCart, 
    Star,
    Check,
    Play,
    Eye,
    MessageCircle,
    Calendar,
    Tag,
    TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import { getComboBySlug, getComboProducts, type Combo, type Product } from '@/lib/data'
import Loading from '@/components/Loading'
import { useNotification } from '@/hooks/useNotification'

export default function ComboDetailPage() {
    const { showSuccess, showError, showInfo } = useNotification()
    const params = useParams()
    const slug = params.slug as string
    
    const [combo, setCombo] = useState<Combo | null>(null)
    const [products, setProducts] = useState<(Product & { quantity: number; role: string })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isLiked, setIsLiked] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showingVideo, setShowingVideo] = useState(false)

    // Determine if combo has video based on URL
    const hasVideo = combo?.media?.url && (
        combo.media.url.includes('.mp4') || 
        combo.media.url.includes('.webm') || 
        combo.media.url.includes('.mov')
    )

    // Create all media array (video + images + thumbnail)
    const allMedia = combo ? [
        ...(hasVideo ? [{ type: 'video', url: combo.media.url!, poster: combo.media.posterImage }] : []),
        ...(combo.media.images || []).map(img => ({ type: 'image', url: img, poster: undefined })),
        ...(combo.thumbnail ? [{ type: 'image', url: combo.thumbnail, poster: undefined }] : [])
    ].filter((item, index, arr) => 
        // Remove duplicates
        arr.findIndex(i => i.url === item.url) === index
    ) : []

    useEffect(() => {
        const loadCombo = async () => {
            try {
                setIsLoading(true)
                const comboData = await getComboBySlug(slug)
                
                if (!comboData) {
                    setError('Không tìm thấy combo này')
                    return
                }

                setCombo(comboData)
                const comboProducts = await getComboProducts(comboData)
                setProducts(comboProducts)
            } catch (err) {
                console.error('Error loading combo:', err)
                setError('Không thể tải combo')
            } finally {
                setIsLoading(false)
            }
        }

        if (slug) {
            loadCombo()
        }
    }, [slug])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
    }

    const handleShare = async () => {
        if (!combo) return

        const shareUrl = window.location.href
        const shareTitle = combo.title
        const shareText = combo.description.length > 100 
            ? combo.description.substring(0, 100) + '...' 
            : combo.description

        // Try native share first (mobile devices)
        if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                })
                showSuccess('Đã chia sẻ!', `Combo "${combo.title}" đã được chia sẻ`)
                return
            } catch (error) {
                console.error('Native share failed:', error)
            }
        }

        // Desktop fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl)
            showSuccess('Đã sao chép!', 'Link combo đã được sao chép vào clipboard')
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = shareUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            showSuccess('Đã sao chép!', 'Link combo đã được sao chép')
        }
    }

    const handleLike = () => {
        if (combo) {
            setIsLiked(!isLiked)
            if (!isLiked) {
                showSuccess('Đã thích!', `Bạn đã thích combo "${combo.title}"`)
            } else {
                showInfo('Đã bỏ thích', `Bạn đã bỏ thích combo "${combo.title}"`)
            }
        }
    }

    const handleAddToCart = () => {
        if (combo) {
            const price = combo.comboPrice || 0
            showSuccess('Đã thêm vào giỏ hàng!', `Combo "${combo.title}" đã được thêm vào giỏ hàng${price > 0 ? ` với giá ${formatPrice(price)}` : ''}`)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        )
    }

    if (error || !combo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/combos">
                        <Button>Quay lại combo</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const mainProducts = products.filter(p => p.role === 'main')
    const accessoryProducts = products.filter(p => p.role === 'accessory')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/combos">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại
                                </Button>
                            </Link>
                            <h1 className="text-lg font-semibold truncate">{combo.title}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                            >
                                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Media Section */}
                    <div className="space-y-6">
                        {/* Main Media Display */}
                        <div className="relative aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden">
                            {showingVideo && hasVideo ? (
                                <video
                                    className="w-full h-full object-cover"
                                    controls
                                    poster={combo.media.posterImage}
                                    preload="metadata"
                                >
                                    <source src={combo.media.url} type="video/mp4" />
                                </video>
                            ) : (
                                <Image
                                    src={allMedia[currentImageIndex]?.url || combo.thumbnail}
                                    alt={combo.title}
                                    fill
                                    className="object-cover"
                                />
                            )}

                            {/* Play button overlay for video thumbnail */}
                            {!showingVideo && hasVideo && currentImageIndex === 0 && (
                                <button
                                    onClick={() => setShowingVideo(true)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                                >
                                    <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                                        <Play className="h-8 w-8 text-gray-800 ml-1" />
                                    </div>
                                </button>
                            )}
                        </div>
                        
                        {/* Media Thumbnails */}
                        {allMedia.length > 1 && (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {allMedia.map((media, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (media.type === 'video') {
                                                setCurrentImageIndex(index)
                                                setShowingVideo(true)
                                            } else {
                                                setCurrentImageIndex(index)
                                                setShowingVideo(false)
                                            }
                                        }}
                                        className={`relative aspect-square rounded-lg overflow-hidden ${
                                            currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                                        } hover:ring-2 hover:ring-blue-300 transition-all`}
                                    >
                                        <Image
                                            src={media.type === 'video' ? (media.poster || media.url) : media.url}
                                            alt={`${combo.title} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        
                                        {/* Video indicator */}
                                        {media.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                    <Eye className="h-4 w-4" />
                                </div>
                                <div className="font-semibold">{formatNumber(combo.views)}</div>
                                <div className="text-sm text-gray-500">Lượt xem</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                                    <Heart className="h-4 w-4" />
                                </div>
                                <div className="font-semibold">{formatNumber(combo.likes)}</div>
                                <div className="text-sm text-gray-500">Lượt thích</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                                    <MessageCircle className="h-4 w-4" />
                                </div>
                                <div className="font-semibold">{formatNumber(combo.comments)}</div>
                                <div className="text-sm text-gray-500">Bình luận</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6">
                        {/* Title & Tags */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {combo.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{combo.title}</h1>
                            <p className="text-lg text-gray-600 leading-relaxed">{combo.description}</p>
                        </div>

                        {/* Pricing - Only show for combo type */}
                        {combo.contentType === 'combo' && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6">
                                <div className="flex items-end gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 line-through">
                                            Giá lẻ: {formatPrice(combo.originalPrice || 0)}
                                        </p>
                                        <p className="text-3xl font-bold text-red-600">
                                            {formatPrice(combo.comboPrice || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-red-500 text-white px-4 py-2 rounded-xl">
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="font-bold">-{combo.savingsPercent || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                            
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-green-600 font-semibold">
                                    🎉 Tiết kiệm: {formatPrice(combo.savings || 0)}
                                </p>
                            </div>
                        </div>
                        )}

                        {/* Features */}
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-4">Ưu điểm combo</h3>
                            <div className="space-y-3">
                                {combo.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="h-3 w-3 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="sticky bottom-4 bg-white rounded-2xl p-4 shadow-lg">
                            <Button 
                                onClick={handleAddToCart}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-3"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {combo.contentType === 'combo' 
                                    ? `Mua combo này - ${formatPrice(combo.comboPrice || 0)}`
                                    : 'Xem chi tiết'
                                }
                            </Button>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                {combo.contentType === 'combo' 
                                    ? 'Giao hàng miễn phí tại Quảng Ngãi'
                                    : 'Thông tin thêm về nội dung này'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Products in Combo */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-8">Sản phẩm trong combo</h2>
                    
                    {/* Main Products */}
                    {mainProducts.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Sản phẩm chính
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {mainProducts.map((product) => (
                                    <div key={product.id} className="relative">
                                        <ProductCard product={product} />
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                                            x{product.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Accessory Products */}
                    {accessoryProducts.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-gray-500" />
                                Phụ kiện đi kèm
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {accessoryProducts.map((product) => (
                                    <div key={product.id} className="relative">
                                        <ProductCard product={product} />
                                        <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                                            x{product.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
