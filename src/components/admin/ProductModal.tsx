'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import Image from 'next/image'
import { type Product } from '@/lib/data'
import { useNotification } from '@/hooks/useNotification'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Partial<Product>) => void
  product?: Product | null
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const { showError } = useNotification()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    brand_id: '',
    category: '',
    category_id: '',
    price: 0,
    salePrice: 0,
    description: '',
    specifications: {},
    images: [],
    inStock: true,
    featured: false
  })

  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([])
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Update form data when product changes (for editing)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        brand_id: product.brand_id || '',
        category: product.category || '',
        category_id: product.category_id || '',
        price: product.price || 0,
        salePrice: product.salePrice || 0,
        description: product.description || '',
        specifications: product.specifications || {},
        images: product.images || [],
        inStock: product.inStock ?? true,
        featured: product.featured ?? false
      })
      
      // Load specifications
      const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({ 
        key, 
        value: Array.isArray(value) ? value.join(', ') : String(value)
      }))
      setSpecifications(specs)
      
      // Load images
      setImages(product.images || [])
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        brand: '',
        brand_id: '',
        category: '',
        category_id: '',
        price: 0,
        salePrice: 0,
        description: '',
        specifications: {},
        images: [],
        inStock: true,
        featured: false
      })
      setSpecifications([])
      setImages([])
    }
    setNewImageUrl('')
  }, [product, isOpen])

  // Load brands and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load brands
        const brandsRes = await fetch('/api/admin/brands')
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          if (brandsData.success && brandsData.data) {
            setBrands(brandsData.data)
          }
        }

        // Load categories
        const categoriesRes = await fetch('/api/admin/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          // Categories API returns array directly, not wrapped in {success, data}
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData)
          }
        }
      } catch (error) {
        console.error('Error loading brands/categories:', error)
      }
    }

    loadData()
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value
        }
        return acc
      }, {} as Record<string, string>)

      const productData = {
        ...formData,
        specifications: specsObject,
        images,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined
      }

      if (product) {
        // Update existing product
        const response = await fetch(`/api/admin/products?id=${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error('Failed to update product')
        }

        const updatedProduct = await response.json()
        onSave(updatedProduct)
      } else {
        // Create new product
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error('Failed to create product')
        }

        const newProduct = await response.json()
        onSave(newProduct)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      showError('Có lỗi xảy ra khi lưu sản phẩm', 'Vui lòng thử lại.')
    }
  }, [formData, specifications, images, onSave, product])

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const addImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl])
      setNewImageUrl('')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('File không hợp lệ', 'Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WebP')
      event.target.value = ''
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      showError('File quá lớn', 'Kích thước tối đa là 5MB')
      event.target.value = ''
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      if (result.success) {
        setImages([...images, result.url])
        // Reset input
        event.target.value = ''
      } else {
        showError('Lỗi tải ảnh', result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showError('Có lỗi xảy ra khi tải ảnh', error instanceof Error ? error.message : 'Unknown error')
      event.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const imageUrl = images[index]
    setImages(images.filter((_, i) => i !== index))
    
    // Delete from server if it's an uploaded file
    if (imageUrl.startsWith('/uploads/')) {
      const filename = imageUrl.split('/').pop()
      fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE',
      }).catch(error => console.error('Delete error:', error))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 z-50 relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thương hiệu *
                    </label>
                    <select
                      required
                      value={formData.brand}
                      onChange={(e) => {
                        const selectedBrand = brands.find(b => b.name === e.target.value)
                        setFormData({ 
                          ...formData, 
                          brand: e.target.value,
                          brand_id: selectedBrand?.id || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => {
                        const selectedCategory = categories.find(c => c.name === e.target.value)
                        setFormData({ 
                          ...formData, 
                          category: e.target.value,
                          category_id: selectedCategory?.id || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá gốc *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá khuyến mãi
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.salePrice || ''}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Còn hàng</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh
                    </label>
                    <div className="space-y-3">
                      {/* Upload File */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tải ảnh từ máy tính:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Hoặc nhập URL:</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={addImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {images.length > 0 && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Ảnh đã thêm:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {images.map((url, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={url}
                                  alt={`Product image ${index + 1}`}
                                  width={150}
                                  height={150}
                                  className="w-full h-24 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Thông số kỹ thuật
                  </label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm thông số
                  </button>
                </div>
                
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tên thông số"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Giá trị"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {product ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  )
}
