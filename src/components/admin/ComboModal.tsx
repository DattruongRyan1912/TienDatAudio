'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Upload, Play, Image as ImageIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import { type Combo, type Product, type ComboProduct } from '@/lib/data'
import { useNotification } from '@/hooks/useNotification'

interface CloudinaryUploadResult {
    public_id: string
    secure_url: string
    url: string
    format: string
    resource_type: string
    width: number
    height: number
    bytes: number
    duration?: number
    eager?: Array<{
        secure_url: string
        url: string
        transformation: string
    }>
}

interface ComboModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (combo: Partial<Combo>) => void
    combo?: Combo | null
    products: Product[]
}

export default function ComboModal({ isOpen, onClose, onSave, combo, products }: ComboModalProps) {
    const { showError } = useNotification()
    const [formData, setFormData] = useState<Partial<Combo>>({
        title: '',
        slug: '',
        type: 'image',
        description: '',
        thumbnail: '',
        media: {
            type: 'image',
            images: []
        },
        products: [],
        contentType: 'post',
        originalPrice: 0,
        comboPrice: 0,
        savings: 0,
        savingsPercent: 0,
        tags: [],
        features: [],
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        featured: false,
        status: 'draft'
    })
    const [newTag, setNewTag] = useState('')
    const [newFeature, setNewFeature] = useState('')
    const [previewMode, setPreviewMode] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [activeUploadTab, setActiveUploadTab] = useState<'thumbnail' | 'media'>('thumbnail')
    const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload')
    const [urlInput, setUrlInput] = useState('')

    useEffect(() => {
        if (combo) {
            setFormData(combo)
        } else {
            setFormData({
                title: '',
                slug: '',
                type: 'image',
                thumbnail: '',
                media: { type: 'image', images: [] },
                description: '',
                products: [],
                contentType: 'post',
                originalPrice: 0,
                comboPrice: 0,
                savings: 0,
                savingsPercent: 0,
                tags: [],
                features: [],
                views: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                createdAt: new Date().toISOString(),
                featured: false,
                status: 'draft'
            })
        }
    }, [combo, isOpen])

    const handleInputChange = (field: keyof Combo, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Auto-generate slug from title
        if (field === 'title') {
            const slug = value.toLowerCase()
                .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
                .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
                .replace(/[íìỉĩị]/g, 'i')
                .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
                .replace(/[úùủũụưứừửữự]/g, 'u')
                .replace(/[ýỳỷỹỵ]/g, 'y')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            
            setFormData(prev => ({
                ...prev,
                slug
            }))
        }
    }

    const calculatePricing = () => {
        // Only calculate pricing for combo content type
        if (formData.contentType !== 'combo') return

        const selectedProducts = formData.products || []
        let totalOriginalPrice = 0

        selectedProducts.forEach(comboProduct => {
            const product = products.find((p: Product) => p.id === comboProduct.id)
            if (product) {
                totalOriginalPrice += product.price * comboProduct.quantity
            }
        })

        const comboPrice = formData.comboPrice || 0
        const savings = Math.max(0, totalOriginalPrice - comboPrice)
        const savingsPercent = totalOriginalPrice > 0 ? Math.round((savings / totalOriginalPrice) * 100) : 0

        setFormData(prev => ({
            ...prev,
            originalPrice: totalOriginalPrice,
            savings,
            savingsPercent
        }))
    }

    useEffect(() => {
        calculatePricing()
    }, [formData.products, formData.comboPrice, products])

    const addProduct = (productId: string) => {
        const existingProduct = formData.products?.find(p => p.id === productId)
        if (existingProduct) {
            setFormData(prev => ({
                ...prev,
                products: prev.products?.map(p =>
                    p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
                ) || []
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                products: [
                    ...(prev.products || []),
                    { id: productId, quantity: 1, role: 'main' }
                ]
            }))
        }
    }

    const removeProduct = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products?.filter(p => p.id !== productId) || []
        }))
    }

    const updateProductQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeProduct(productId)
            return
        }

        setFormData(prev => ({
            ...prev,
            products: prev.products?.map(p =>
                p.id === productId ? { ...p, quantity } : p
            ) || []
        }))
    }

    const updateProductRole = (productId: string, role: 'main' | 'accessory') => {
        setFormData(prev => ({
            ...prev,
            products: prev.products?.map(p =>
                p.id === productId ? { ...p, role } : p
            ) || []
        }))
    }

    const addTag = () => {
        if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.trim()]
            }))
            setNewTag('')
        }
    }

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag) || []
        }))
    }

    const addFeature = () => {
        if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features?.filter(f => f !== feature) || []
        }))
    }

    const handleMediaChange = (field: string, value: any) => {
        setFormData(prev => {
            // Sync both formData.type and media.type
            if (field === 'type') {
                return {
                    ...prev,
                    type: value,
                    media: {
                        ...prev.media!,
                        type: value
                    }
                }
            }
            
            return {
                ...prev,
                media: {
                    ...prev.media!,
                    [field]: value
                }
            }
        })
    }

    const handleCloudinaryUpload = (result: CloudinaryUploadResult, uploadType: 'thumbnail' | 'video' | 'image') => {
        console.log('Cloudinary upload result:', result)
        
        if (uploadType === 'thumbnail') {
            setFormData(prev => ({
                ...prev,
                thumbnail: result.secure_url
            }))
        } else if (uploadType === 'video') {
            setFormData(prev => ({
                ...prev,
                type: 'video',
                media: {
                    type: 'video',
                    url: result.secure_url,
                    posterImage: result.eager?.[0]?.secure_url || result.secure_url
                }
            }))
        } else if (uploadType === 'image') {
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media!,
                    images: [...(prev.media?.images || []), result.secure_url]
                }
            }))
        }
        
        setIsUploading(false)
    }

    const handleUrlInput = (uploadType: 'thumbnail' | 'video' | 'image') => {
        if (!urlInput.trim()) {
            showError('Thiếu thông tin', 'Vui lòng nhập URL')
            return
        }

        // Validate URL format
        try {
            new URL(urlInput)
        } catch {
            showError('URL không hợp lệ', 'Vui lòng nhập URL đúng định dạng')
            return
        }

        if (uploadType === 'thumbnail') {
            setFormData(prev => ({
                ...prev,
                thumbnail: urlInput
            }))
        } else if (uploadType === 'video') {
            setFormData(prev => ({
                ...prev,
                type: 'video',
                media: {
                    type: 'video',
                    url: urlInput,
                    posterImage: urlInput // Use same URL for poster if no specific poster
                }
            }))
        } else if (uploadType === 'image') {
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media!,
                    images: [...(prev.media?.images || []), urlInput]
                }
            }))
        }
        
        setUrlInput('')
    }

    const handleUploadError = (error: string) => {
        console.error('Upload error:', error)
        setIsUploading(false)
        
        // Provide more specific error messages
        if (error.includes('File size too large')) {
            showError('File quá lớn', 'Video không được vượt quá 50MB. Vui lòng nén video hoặc chọn file khác.')
        } else if (error.includes('timeout') || error.includes('timeout')) {
            showError('Upload timeout', 'Video quá lớn hoặc mạng chậm. Vui lòng thử lại hoặc nén video.')
        } else if (error.includes('ENOENT') || error.includes('build')) {
            showError('Lỗi hệ thống', 'Lỗi build manifest. Vui lòng refresh trang và thử lại.')
        } else {
            showError('Upload thất bại', error || 'Có lỗi xảy ra khi upload. Vui lòng thử lại.')
        }
    }

    const addImage = () => {
        const imageUrl = prompt('Nhập URL hình ảnh:')
        if (imageUrl) {
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media!,
                    images: [...(prev.media?.images || []), imageUrl]
                }
            }))
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            media: {
                ...prev.media!,
                images: prev.media?.images?.filter((_, i) => i !== index) || []
            }
        }))
    }

    const handleSave = () => {
        // Validation
        if (!formData.title?.trim()) {
            showError('Thiếu thông tin', 'Vui lòng nhập tiêu đề combo')
            return
        }

        if (!formData.description?.trim()) {
            showError('Thiếu thông tin', 'Vui lòng nhập mô tả combo')
            return
        }

        // Only validate products and pricing for combo type
        if (formData.contentType === 'combo') {
            if (!formData.products || formData.products.length === 0) {
                showError('Thiếu thông tin', 'Vui lòng chọn ít nhất một sản phẩm cho combo')
                return
            }

            if (!formData.comboPrice || formData.comboPrice <= 0) {
                showError('Thiếu thông tin', 'Vui lòng nhập giá combo hợp lệ')
                return
            }
        }

        onSave(formData)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between py-3 px-6 border-b">
                        <h2 className="text-2xl font-bold">
                            {combo ? 'Chỉnh sửa combo' : 'Tạo combo mới'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewMode(!previewMode)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        {previewMode ? (
                            // Preview Mode
                            <div className="p-6">
                                <div className="max-w-md mx-auto bg-black rounded-2xl overflow-hidden">
                                    {/* Reel Preview */}
                                    <div className="relative aspect-[9/16] bg-gray-900">
                                        {formData.type === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Play className="h-16 w-16 text-white/60" />
                                                <p className="absolute bottom-4 left-4 text-white text-sm">
                                                    Video: {formData.media?.url || 'Chưa có URL'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                {formData.media?.images?.[0] ? (
                                                    <img 
                                                        src={formData.media.images[0]} 
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-16 w-16 text-white/60" />
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Overlay content */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            <div className="absolute bottom-4 left-4 right-16 text-white">
                                                <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
                                                <p className="text-sm opacity-90 line-clamp-2">{formData.description}</p>
                                                <div className="mt-2 bg-red-500 rounded px-3 py-1 inline-block">
                                                    <span className="text-sm font-bold">
                                                        {formatPrice(formData.comboPrice || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    value={formData.title || ''}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nhập tiêu đề combo..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug || ''}
                                                    onChange={(e) => handleInputChange('slug', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="combo-url-slug"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Mô tả</label>
                                                <textarea
                                                    value={formData.description || ''}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Mô tả chi tiết về combo..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Loại media</label>
                                                    <select
                                                        value={formData.type || 'image'}
                                                        onChange={(e) => {
                                                            handleInputChange('type', e.target.value)
                                                            handleMediaChange('type', e.target.value)
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="image">Hình ảnh</option>
                                                        <option value="video">Video</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Loại nội dung</label>
                                                    <select
                                                        value={formData.contentType || 'post'}
                                                        onChange={(e) => handleInputChange('contentType', e.target.value as 'combo' | 'post')}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="post">Bài viết (không có giá)</option>
                                                        <option value="combo">Combo sản phẩm (có giá)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                                                    <select
                                                        value={formData.status || 'draft'}
                                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="draft">Bản nháp</option>
                                                        <option value="active">Hoạt động</option>
                                                        <option value="archived">Lưu trữ</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.featured || false}
                                                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium">Combo nổi bật</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                    {/* Media */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-4">Media Upload (Cloudinary)</h3>
                        
                        <div className="space-y-6">
                            {/* Upload Tabs */}
                            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveUploadTab('thumbnail')}
                                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeUploadTab === 'thumbnail'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Thumbnail
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveUploadTab('media')}
                                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeUploadTab === 'media'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {formData.type === 'video' ? 'Video' : 'Images'}
                                </button>
                            </div>

                            {/* Thumbnail Upload */}
                            {activeUploadTab === 'thumbnail' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Upload thumbnail cho combo (khuyến nghị 1080x1350px)
                                    </p>

                                    {/* Input Method Selector */}
                                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-xs">
                                        <button
                                            type="button"
                                            onClick={() => setInputMethod('upload')}
                                            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                inputMethod === 'upload'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Upload file
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputMethod('url')}
                                            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                inputMethod === 'url'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Từ URL
                                        </button>
                                    </div>
                                    
                                    {formData.thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnail}
                                                alt="Thumbnail preview"
                                                className="w-full max-w-xs rounded-lg shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {inputMethod === 'upload' ? (
                                                <CloudinaryUpload
                                                    onUploadComplete={(result) => handleCloudinaryUpload(result, 'thumbnail')}
                                                    onUploadError={handleUploadError}
                                                    accept="image"
                                                    type="combo-image"
                                                    folder="thumbnails"
                                                    maxSize={10}
                                                />
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={urlInput}
                                                        onChange={(e) => setUrlInput(e.target.value)}
                                                        placeholder="Nhập URL hình ảnh từ Cloudinary..."
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleUrlInput('thumbnail')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        Thêm
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Media Upload */}
                            {activeUploadTab === 'media' && (
                                <div className="space-y-4">
                                    {/* Media Type Selector */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Loại media</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleInputChange('type', 'image')
                                                    handleMediaChange('type', 'image')
                                                }}
                                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                                    formData.type === 'image'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                                Hình ảnh
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleInputChange('type', 'video')
                                                    handleMediaChange('type', 'video')
                                                }}
                                                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                                    formData.type === 'video'
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                <Play className="h-4 w-4" />
                                                Video
                                            </button>
                                        </div>
                                    </div>

                                    {/* Video Upload */}
                                    {formData.type === 'video' && (
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h4 className="font-medium text-blue-900 mb-2">📹 Hướng dẫn upload video</h4>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Khuyến nghị kích thước: 1080x1920px (9:16)</li>
                                                    <li>• Kích thước file tối đa: 50MB</li>
                                                    <li>• Định dạng: MP4, MOV, AVI</li>
                                                    <li>• Video &gt;10MB có thể mất 2-3 phút để upload</li>
                                                    <li>• Nếu upload timeout, hãy nén video trước khi upload</li>
                                                </ul>
                                            </div>

                                            {/* Input Method Selector */}
                                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => setInputMethod('upload')}
                                                    className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                        inputMethod === 'upload'
                                                            ? 'bg-white text-gray-900 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    Upload file
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setInputMethod('url')}
                                                    className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                        inputMethod === 'url'
                                                            ? 'bg-white text-gray-900 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    Từ URL
                                                </button>
                                            </div>
                                            
                                            {formData.media?.url ? (
                                                <div className="relative">
                                                    <video
                                                        src={formData.media.url}
                                                        poster={formData.media.posterImage}
                                                        controls
                                                        className="w-full max-w-xs rounded-lg shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMediaChange('url', '')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {inputMethod === 'upload' ? (
                                                        <CloudinaryUpload
                                                            onUploadComplete={(result) => handleCloudinaryUpload(result, 'video')}
                                                            onUploadError={handleUploadError}
                                                            accept="video"
                                                            type="video"
                                                            folder="combos"
                                                            maxSize={50}
                                                        />
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="url"
                                                                value={urlInput}
                                                                onChange={(e) => setUrlInput(e.target.value)}
                                                                placeholder="Nhập URL video từ Cloudinary..."
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleUrlInput('video')}
                                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                                            >
                                                                Thêm
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Image Upload */}
                                    {formData.type === 'image' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Upload hình ảnh cho combo (khuyến nghị 1080x1350px, có thể upload nhiều ảnh)
                                            </p>
                                            
                                            {/* Existing Images */}
                                            {formData.media?.images && formData.media.images.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    {formData.media.images.map((image, index) => (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={image}
                                                                alt={`Image ${index + 1}`}
                                                                className="w-full aspect-square object-cover rounded-lg shadow-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Upload New Images */}
                                            <CloudinaryUpload
                                                onUploadComplete={(result) => handleCloudinaryUpload(result, 'image')}
                                                onUploadError={handleUploadError}
                                                accept="image"
                                                type="combo-image"
                                                folder="combos"
                                                maxSize={10}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>                                    {/* Tags & Features */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-4">Tags & Tính năng</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Tags</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Nhập tag..."
                                                    />
                                                    <Button onClick={addTag} size="sm">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.tags?.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                                                        >
                                                            {tag}
                                                            <button
                                                                onClick={() => removeTag(tag)}
                                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Tính năng</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={newFeature}
                                                        onChange={(e) => setNewFeature(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Nhập tính năng..."
                                                    />
                                                    <Button onClick={addFeature} size="sm">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {formData.features?.map((feature) => (
                                                        <div
                                                            key={feature}
                                                            className="flex items-center justify-between bg-white p-2 rounded border"
                                                        >
                                                            <span className="text-sm">{feature}</span>
                                                            <button
                                                                onClick={() => removeFeature(feature)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Products - Only show for combo type */}
                                    {formData.contentType === 'combo' && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold mb-4">Sản phẩm trong combo</h3>
                                        
                                        <div className="space-y-4">
                                            {/* Selected Products */}
                                            {formData.products?.map((comboProduct) => {
                                                const product = products.find((p: Product) => p.id === comboProduct.id)
                                                if (!product) return null

                                                return (
                                                    <div key={comboProduct.id} className="bg-white border rounded-lg p-3">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{product.name}</p>
                                                                <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => removeProduct(comboProduct.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={comboProduct.quantity}
                                                                    onChange={(e) => updateProductQuantity(comboProduct.id, parseInt(e.target.value))}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-600 mb-1">Loại</label>
                                                                <select
                                                                    value={comboProduct.role}
                                                                    onChange={(e) => updateProductRole(comboProduct.id, e.target.value as 'main' | 'accessory')}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                >
                                                                    <option value="main">Chính</option>
                                                                    <option value="accessory">Phụ kiện</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                            {/* Add Product */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-2">Chọn sản phẩm để thêm vào combo:</p>
                                                <div className="max-h-48 overflow-y-auto space-y-2">
                                                    {products.map((product: Product) => (
                                                        <button
                                                            key={product.id}
                                                            onClick={() => addProduct(product.id)}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-left"
                                                        >
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium">{product.name}</p>
                                                                <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    )}

                                    {/* Pricing - Only show for combo type */}
                                    {formData.contentType === 'combo' && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold mb-4">Giá combo</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-white border rounded-lg p-3">
                                                <p className="text-sm text-gray-600">Tổng giá lẻ</p>
                                                <p className="font-bold text-lg">{formatPrice(formData.originalPrice || 0)}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Giá combo</label>
                                                <input
                                                    type="number"
                                                    value={formData.comboPrice || ''}
                                                    onChange={(e) => handleInputChange('comboPrice', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nhập giá combo..."
                                                />
                                            </div>

                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-sm text-green-600">Tiết kiệm</p>
                                                <p className="font-bold text-green-700">
                                                    {formatPrice(formData.savings || 0)} ({formData.savingsPercent || 0}%)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {combo ? 'Cập nhật' : 'Tạo combo'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
