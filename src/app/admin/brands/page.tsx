'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Image from 'next/image'
import { useNotification } from '@/hooks/useNotification'
import ConfirmDialog from '@/components/ui/confirm-dialog'

interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  website: string
  country: string
  featured: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

interface BrandForm {
  name: string
  slug: string
  description: string
  logo: string
  website: string
  country: string
  featured: boolean
}

export default function BrandsPage() {
  const { showSuccess, showError, showConfirm, confirmDialog, closeConfirm } = useNotification()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandForm, setBrandForm] = useState<BrandForm>({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    country: '',
    featured: false
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/brands')
      const data = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBrand = async () => {
    try {
      const url = '/api/admin/brands'
      const method = editingBrand ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brand: editingBrand ? { ...brandForm, id: editingBrand.id } : brandForm 
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadBrands()
        resetForm()
        showSuccess(editingBrand ? 'Cập nhật thương hiệu thành công!' : 'Thêm thương hiệu thành công!')
      } else {
        showError('Có lỗi xảy ra', data.message || 'Không xác định')
      }
    } catch (error) {
      console.error('Error saving brand:', error)
      showError('Lỗi khi lưu thương hiệu')
    }
  }

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    showConfirm(
      {
        title: 'Xóa thương hiệu',
        message: `Bạn có chắc chắn muốn xóa thương hiệu "${brandName}"? Hành động này không thể hoàn tác.`,
        type: 'danger'
      },
      async () => {
        try {
          const response = await fetch('/api/admin/brands', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandId })
          })

          const data = await response.json()
          if (data.success) {
            await loadBrands()
            showSuccess('Xóa thương hiệu thành công!')
          } else {
            showError('Có lỗi xảy ra', data.message || 'Không xác định')
          }
        } catch (error) {
          console.error('Error deleting brand:', error)
          showError('Lỗi khi xóa thương hiệu')
        }
      }
    )
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setBrandForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      website: brand.website,
      country: brand.country,
      featured: brand.featured
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setBrandForm({
      name: '',
      slug: '',
      description: '',
      logo: '',
      website: '',
      country: '',
      featured: false
    })
    setEditingBrand(null)
    setIsModalOpen(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setBrandForm(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      if (result.success) {
        setBrandForm(prev => ({ ...prev, logo: result.url }))
        // Reset input
        event.target.value = ''
      } else {
        showError('Lỗi tải ảnh', result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showError('Có lỗi xảy ra khi tải ảnh')
    }
  }

  const removeLogo = () => {
    setBrandForm(prev => ({ ...prev, logo: '' }))
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thương hiệu</h1>
            <p className="text-gray-600">Quản lý các thương hiệu sản phẩm</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thương hiệu</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Brands Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách thương hiệu ({filteredBrands.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="Đang tải thương hiệu..." />
              </div>
            ) : filteredBrands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {brand.logo ? (
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-medium">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                          <p className="text-sm text-gray-600">{brand.country}</p>
                        </div>
                      </div>
                      
                      {brand.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Nổi bật
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{brand.productCount} sản phẩm</span>
                      <span>{new Date(brand.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditBrand(brand)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBrand(brand.id, brand.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <p className="text-gray-600">
                  {searchQuery ? 'Không tìm thấy thương hiệu nào' : 'Chưa có thương hiệu nào'}
                </p>
              </div>
            )}
              </div>
        </div>

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên thương hiệu *
                    </label>
                    <input
                      type="text"
                      value={brandForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Sony, Samsung..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={brandForm.slug}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="sony, samsung..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={brandForm.description}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Mô tả về thương hiệu..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo thương hiệu
                    </label>
                    
                    {/* Current Logo Preview */}
                    {brandForm.logo && (
                      <div className="mb-4">
                        <div className="relative inline-block">
                          <Image
                            src={brandForm.logo.startsWith('http') || brandForm.logo.startsWith('/') ? brandForm.logo : `/uploads/${brandForm.logo}`}
                            alt="Brand logo preview"
                            width={120}
                            height={80}
                            className="rounded-lg border object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* File Upload */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Hoặc tải ảnh lên (JPG, PNG, GIF - tối đa 5MB)
                        </p>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <input
                          type="url"
                          value={brandForm.logo}
                          onChange={(e) => setBrandForm(prev => ({ ...prev, logo: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Hoặc nhập URL logo: https://example.com/logo.png"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={brandForm.website}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://brand-website.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    value={brandForm.country}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Nhật Bản, Hàn Quốc..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={brandForm.featured}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Thương hiệu nổi bật
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveBrand}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!brandForm.name}
                >
                  {editingBrand ? 'Cập nhật' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}
