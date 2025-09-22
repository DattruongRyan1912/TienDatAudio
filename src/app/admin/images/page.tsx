'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Eye, Trash2, Edit3, Plus, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useNotification } from '@/hooks/useNotification'

interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string
  isMain: boolean
  sortOrder: number
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  category: string
  brand: string
  price: number
  salePrice?: number
  images: string[]
  specifications: Record<string, string | string[]>
  description: string
  features: string[]
  inStock: boolean
  featured: boolean
  bestseller: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: string
  updatedAt: string
}

export default function AdminImagesPage() {
  const { showError, showSuccess, showConfirm } = useNotification()
  const [images, setImages] = useState<ProductImage[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null)
  const [imageForm, setImageForm] = useState({
    url: '',
    alt: '',
    isMain: false,
    sortOrder: 0
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      // Load products
      const productsResponse = await fetch('/api/admin/products')
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log('Products data:', productsData) // Debug log
        
        // Check if response is array (new format) or object with success property
        if (Array.isArray(productsData)) {
          console.log('Products loaded (array format):', productsData.length, 'items')
          setProducts(productsData)
        } else if (productsData.success && productsData.data) {
          console.log('Products loaded (object format):', productsData.data.length, 'items')
          setProducts(productsData.data)
        } else {
          console.error('Unexpected products data format:', productsData)
          setProducts([])
        }
      } else {
        console.error('Failed to fetch products:', productsResponse.status)
        setProducts([])
      }
      
      // Load all images
      await loadAllImages()
    } catch (error) {
      console.error('Error loading data:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (selectedProduct) {
      loadImagesByProduct(selectedProduct)
    }
  }, [selectedProduct])

  const loadAllImages = async () => {
    try {
      const response = await fetch('/api/admin/images')
      const data = await response.json()
      if (data.success) {
        setImages(data.data)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const loadImagesByProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/images?productId=${productId}`)
      const data = await response.json()
      if (data.success) {
        setImages(data.data)
      }
    } catch (error) {
      console.error('Error loading images for product:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!selectedProduct) {
      showError('Thiếu thông tin', 'Vui lòng chọn sản phẩm trước')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('Định dạng không hỗ trợ', 'Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WebP')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      showError('File quá lớn', 'Kích thước tối đa là 5MB')
      return
    }

    setUploading(true)
    try {
      // Upload file to server first
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      // Now save image info to database
      const newImage: Omit<ProductImage, 'id' | 'createdAt'> = {
        productId: selectedProduct,
        url: uploadResult.url,
        alt: file.name,
        isMain: images.filter(img => img.productId === selectedProduct).length === 0,
        sortOrder: images.filter(img => img.productId === selectedProduct).length
      }

      const response = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: newImage })
      })

      const data = await response.json()
      if (data.success) {
        await loadImagesByProduct(selectedProduct)
        showSuccess('Upload thành công', 'Ảnh đã được tải lên thành công!')
      } else {
        throw new Error(data.error || 'Failed to save image info')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      showError('Upload thất bại', 'Có lỗi xảy ra khi tải ảnh: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleSaveImage = async () => {
    try {
      if (!editingImage) {
        // Create new image
        const newImage = {
          ...imageForm,
          productId: selectedProduct,
          sortOrder: images.filter(img => img.productId === selectedProduct).length
        }

        const response = await fetch('/api/admin/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: newImage })
        })

        const data = await response.json()
        if (data.success) {
          await loadImagesByProduct(selectedProduct)
          resetForm()
        }
      } else {
        // Update existing image
        const updatedImage = {
          ...editingImage,
          ...imageForm
        }

        const response = await fetch('/api/admin/images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: updatedImage })
        })

        const data = await response.json()
        if (data.success) {
          await loadImagesByProduct(selectedProduct)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    showConfirm(
      {
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa hình ảnh này?',
        type: 'danger'
      },
      async () => {
        try {
          const response = await fetch('/api/admin/images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
          })

          const data = await response.json()
          if (data.success) {
            await loadImagesByProduct(selectedProduct)
          }
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }
    )
  }

  const handleSetMainImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      const updatedImage = { ...image, isMain: true }

      const response = await fetch('/api/admin/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: updatedImage })
      })

      const data = await response.json()
      if (data.success) {
        await loadImagesByProduct(selectedProduct)
      }
    } catch (error) {
      console.error('Error setting main image:', error)
    }
  }

  const handleEditImage = (image: ProductImage) => {
    setEditingImage(image)
    setImageForm({
      url: image.url,
      alt: image.alt,
      isMain: image.isMain,
      sortOrder: image.sortOrder
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setImageForm({
      url: '',
      alt: '',
      isMain: false,
      sortOrder: 0
    })
    setEditingImage(null)
    setIsModalOpen(false)
  }

  const filteredImages = selectedProduct 
    ? images.filter(img => img.productId === selectedProduct)
    : images

  return (
    <>
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý hình ảnh</h1>
            <p className="text-gray-600">Quản lý hình ảnh sản phẩm</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hình ảnh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn sản phẩm
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Đang tải...' : `Tất cả sản phẩm (${products.length})`}
                </option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.brand}
                  </option>
                ))}
              </select>
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                Đã tải {products.length} sản phẩm
              </div>
            </div>
            
            {/* Upload Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload hình ảnh
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageUpload(file)
                      // Reset input value to allow re-uploading same file
                      e.target.value = ''
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label 
                  htmlFor="image-upload" 
                  className={`cursor-pointer inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Đang upload...' : 'Chọn hình ảnh để upload'}</span>
                </label>
                {!selectedProduct && (
                  <p className="text-sm text-red-500 mt-2">
                    * Vui lòng chọn sản phẩm trước khi upload ảnh
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hình ảnh sản phẩm ({filteredImages.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Main Image Badge */}
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Chính
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditImage(image)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {!image.isMain && (
                        <button
                          onClick={() => handleSetMainImage(image.id)}
                          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                          title="Đặt làm ảnh chính"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.alt}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  {selectedProduct ? 'Sản phẩm này chưa có hình ảnh nào' : 'Chọn sản phẩm để xem hình ảnh'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingImage ? 'Chỉnh sửa hình ảnh' : 'Thêm hình ảnh mới'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  value={imageForm.url}
                  onChange={(e) => setImageForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt text
                </label>
                <input
                  type="text"
                  value={imageForm.alt}
                  onChange={(e) => setImageForm(prev => ({ ...prev, alt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả hình ảnh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={imageForm.sortOrder}
                  onChange={(e) => setImageForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={imageForm.isMain}
                  onChange={(e) => setImageForm(prev => ({ ...prev, isMain: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isMain" className="ml-2 text-sm text-gray-700">
                  Đặt làm ảnh chính
                </label>
              </div>

              {imageForm.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="relative h-32 w-full rounded-lg border overflow-hidden">
                    <Image
                      src={imageForm.url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveImage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!imageForm.url || !imageForm.alt}
              >
                {editingImage ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
