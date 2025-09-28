'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Heart, 
    Share2, 
    MessageCircle, 
    Bookmark, 
    Phone, 
    Play, 
    Pause,
    Volume2,
    VolumeX,
    ArrowUp,
    ArrowDown,
    Eye,
    Tag,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContactModal from '@/components/ui/contact-modal'
import { type Combo } from '@/lib/data'
import { useNotification } from '@/hooks/useNotification'

interface ReelViewerProps {
    combos: Combo[]
    onComboChange?: (index: number) => void
}

interface ReelItemProps {
    combo: Combo
    isActive: boolean
    onLike: () => void
    onShare: () => void
    onComment: () => void
    onSave: () => void
}

function ReelItem({ combo, isActive, onLike, onShare, onComment, onSave }: ReelItemProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showContactModal, setShowContactModal] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (combo.type === 'video' && videoRef.current) {
            if (isActive && isPlaying) {
                videoRef.current.play()
            } else {
                videoRef.current.pause()
            }
        }
    }, [isActive, isPlaying, combo.type])

    useEffect(() => {
        // Auto play video when reel becomes active
        if (isActive && combo.type === 'video') {
            setIsPlaying(true)
        } else {
            setIsPlaying(false)
        }
    }, [isActive, combo.type])

    useEffect(() => {
        // Auto rotate images for image-type combos
        if (combo.type === 'image' && combo.media.images && isActive) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prev => 
                    (prev + 1) % (combo.media.images?.length || 1)
                )
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [combo.type, combo.media.images, isActive])

    // Sync muted state with video element
    useEffect(() => {
        if (combo.type === 'video' && videoRef.current) {
            videoRef.current.muted = isMuted
        }
    }, [isMuted, combo.type])

    // Listen to video events to sync play state
    useEffect(() => {
        const video = videoRef.current
        if (combo.type === 'video' && video) {
            const handlePlay = () => setIsPlaying(true)
            const handlePause = () => setIsPlaying(false)
            
            video.addEventListener('play', handlePlay)
            video.addEventListener('pause', handlePause)
            
            return () => {
                video.removeEventListener('play', handlePlay)
                video.removeEventListener('pause', handlePause)
            }
        }
    }, [combo.type])

    const handleLike = () => {
        setIsLiked(!isLiked)
        onLike()
    }

    const handleSave = () => {
        setIsSaved(!isSaved)
        onSave()
    }

    const handlePlayPause = async () => {
        if (combo.type === 'video' && videoRef.current) {
            try {
                if (isPlaying) {
                    videoRef.current.pause()
                    setIsPlaying(false)
                } else {
                    await videoRef.current.play()
                    setIsPlaying(true)
                }
            } catch (error) {
                console.error('Error playing/pausing video:', error)
                // Reset playing state if there's an error
                setIsPlaying(videoRef.current.paused === false)
            }
        }
    }

    const handleMuteToggle = () => {
        if (combo.type === 'video' && videoRef.current) {
            const newMutedState = !isMuted
            videoRef.current.muted = newMutedState
            setIsMuted(newMutedState)
        }
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Media Content */}
            <div className="absolute inset-0">
                {combo.type === 'video' ? (
                    <div className="relative h-full w-full flex items-center justify-center bg-black">
                        <video
                            ref={videoRef}
                            className="max-h-full max-w-full object-contain"
                            loop
                            muted={isMuted}
                            playsInline
                            poster={combo.media.posterImage}
                        >
                            <source src={combo.media.url} type="video/mp4" />
                        </video>
                        
                        {/* Video Controls */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handlePlayPause}
                                className="bg-black/30 rounded-full p-4 backdrop-blur-sm"
                            >
                                {isPlaying ? (
                                    <Pause className="h-8 w-8 text-white" />
                                ) : (
                                    <Play className="h-8 w-8 text-white" />
                                )}
                            </motion.button>
                        </div>

                        {/* Mute Button */}
                        <button
                            onClick={handleMuteToggle}
                            className="absolute top-4 right-4 bg-black/30 rounded-full p-2 backdrop-blur-sm"
                        >
                            {isMuted ? (
                                <VolumeX className="h-5 w-5 text-white" />
                            ) : (
                                <Volume2 className="h-5 w-5 text-white" />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="relative h-full w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="h-full w-full"
                            >
                                <Image
                                    src={combo.media.images?.[currentImageIndex] || combo.thumbnail}
                                    alt={combo.title}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Image Indicators */}
                        {combo.media.images && combo.media.images.length > 1 && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {combo.media.images.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${
                                            index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex">
                {/* Left Side - Main Content */}
                <div className="flex-1 flex flex-col justify-end p-4 pb-20">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {combo.tags.slice(0, 3).map((tag) => (
                            <div key={tag} className="inline-flex items-center bg-white/20 text-white border border-white/30 rounded-full px-3 py-1 text-xs font-semibold">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </div>
                        ))}
                    </div>

                    {/* Title & Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                            {combo.title}
                        </h2>
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">
                            {combo.description}
                        </p>
                    </motion.div>

                    {/* Price & Savings */}
                    {/* Pricing - Only show for combo type */}
                    {combo.contentType === 'combo' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 mb-4"
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-white/80 text-xs line-through">
                                        {formatPrice(combo.originalPrice || 0)}
                                    </p>
                                    <p className="text-white font-bold text-lg">
                                        {formatPrice(combo.comboPrice || 0)}
                                    </p>
                                </div>
                                <div className="bg-white/20 rounded-full px-3 py-1">
                                    <span className="text-white font-bold text-sm">
                                        -{combo.savingsPercent || 0}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                        transition={{ delay: 0.6 }}
                        className="mb-4"
                    >
                        {combo.features.slice(0, 2).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-1 bg-green-400 rounded-full" />
                                <span className="text-white/90 text-sm">{feature}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-4 text-white/80 text-sm"
                    >
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{formatNumber(combo.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(combo.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Actions */}
                <div className="w-16 flex flex-col items-center justify-end pb-20 pr-2">
                    <div className="space-y-6">
                        {/* Like Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className={`p-3 rounded-full ${isLiked ? 'bg-red-500' : 'bg-white/20'} backdrop-blur-sm`}>
                                <Heart className={`h-6 w-6 ${isLiked ? 'text-white fill-current' : 'text-white'}`} />
                            </div>
                            <span className="text-white text-xs font-medium">
                                {formatNumber(combo.likes + (isLiked ? 1 : 0))}
                            </span>
                        </motion.button>

                        {/* Comment Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onComment}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">
                                {formatNumber(combo.comments)}
                            </span>
                        </motion.button>

                        {/* Share Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onShare}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <Share2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">
                                {formatNumber(combo.shares)}
                            </span>
                        </motion.button>

                        {/* Save Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSave}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className={`p-3 rounded-full ${isSaved ? 'bg-yellow-500' : 'bg-white/20'} backdrop-blur-sm`}>
                                <Bookmark className={`h-6 w-6 ${isSaved ? 'text-white fill-current' : 'text-white'}`} />
                            </div>
                        </motion.button>

                        {/* Contact Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowContactModal(true)}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="p-3 rounded-full bg-green-500 backdrop-blur-sm">
                                <Phone className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">Liên hệ</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            <ContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                productName={combo.title}
            />
        </div>
    )
}

export default function ReelViewer({ combos, onComboChange }: ReelViewerProps) {
    const { showSuccess, showError, showInfo } = useNotification()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Minimum swipe distance
    const minSwipeDistance = 50

    useEffect(() => {
        onComboChange?.(currentIndex)
    }, [currentIndex, onComboChange])

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientY)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        
        const distance = touchStart - touchEnd
        const isUpSwipe = distance > minSwipeDistance
        const isDownSwipe = distance < -minSwipeDistance

        if (isUpSwipe && currentIndex < combos.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
        if (isDownSwipe && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        } else if (e.key === 'ArrowDown' && currentIndex < combos.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex, combos.length])

    const handleLike = () => {
        // Handle like action
        const combo = combos[currentIndex]
        showSuccess('Đã thích!', `Bạn đã thích combo "${combo.title}"`)
        console.log('Liked combo:', combo.id)
    }

    const handleShare = async () => {
        const combo = combos[currentIndex]
        const shareUrl = window.location.origin + `/combos/${combo.slug}`
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

        // Desktop fallback: Show share options
        const shareOptions = [
            {
                name: 'Copy Link',
                action: async () => {
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
            },
            {
                name: 'Facebook',
                action: () => {
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                    window.open(fbUrl, '_blank', 'width=600,height=400')
                    showSuccess('Đã mở Facebook', 'Cửa sổ chia sẻ Facebook đã được mở')
                }
            },
            {
                name: 'Telegram',
                action: () => {
                    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
                    window.open(telegramUrl, '_blank')
                    showSuccess('Đã mở Telegram', 'Cửa sổ chia sẻ Telegram đã được mở')
                }
            },
            {
                name: 'WhatsApp',
                action: () => {
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' - ' + shareUrl)}`
                    window.open(whatsappUrl, '_blank')
                    showSuccess('Đã mở WhatsApp', 'Cửa sổ chia sẻ WhatsApp đã được mở')
                }
            }
        ]

        // For now, just use copy link as main action
        // TODO: Implement share menu modal later
        await shareOptions[0].action()
    }

    const handleComment = () => {
        // Handle comment action
        const combo = combos[currentIndex]
        showInfo('Bình luận', `Mở bình luận cho combo "${combo.title}"`)
        console.log('Comment on combo:', combo.id)
    }

    const handleSave = () => {
        // Handle save action
        const combo = combos[currentIndex]
        showSuccess('Đã lưu!', `Combo "${combo.title}" đã được lưu vào danh sách yêu thích`)
        console.log('Saved combo:', combo.id)
    }

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 bg-black z-50 overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Navigation Hints */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className="text-white text-sm">{currentIndex + 1}</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/60 text-sm">{combos.length}</span>
                </div>
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
                <button
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 bg-black/30 rounded-full p-2 backdrop-blur-sm"
                >
                    <ArrowUp className="h-6 w-6 text-white" />
                </button>
            )}

            {currentIndex < combos.length - 1 && (
                <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="absolute bottom-32 left-4 transform -translate-y-1/2 z-10 bg-black/30 rounded-full p-2 backdrop-blur-sm"
                >
                    <ArrowDown className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Reel Items */}
            <div 
                className="h-full transition-transform duration-300 ease-out"
                style={{ 
                    transform: `translateY(-${currentIndex * 100}vh)` 
                }}
            >
                {combos.map((combo, index) => (
                    <ReelItem
                        key={combo.id}
                        combo={combo}
                        isActive={index === currentIndex}
                        onLike={handleLike}
                        onShare={handleShare}
                        onComment={handleComment}
                        onSave={handleSave}
                    />
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={() => window.history.back()}
                className="absolute top-4 right-4 z-10 bg-black/30 rounded-full p-2 backdrop-blur-sm"
            >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}
