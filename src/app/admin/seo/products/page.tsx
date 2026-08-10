'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getProducts, type Product, type ProductSEO } from '@/lib/data'
import { generateProductSEODefaults, validateProductSEO } from '@/lib/seo'
import { Search, Edit, Eye, Save, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import SEOHelp from '@/components/SEOHelp'

export default function ProductSEOPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [seoData, setSeoData] = useState<ProductSEO | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const allProducts = await getProducts({})
      setProducts(allProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEditSEO = async (product: Product) => {
    setSelectedProduct(product)
    setIsEditing(true)
    setValidationErrors([])
    setValidationWarnings([])
    setSaved(false)

    try {
      // Try to load existing SEO data from API
      const response = await fetch(`/api/admin/seo/products?productId=${product.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.seo) {
          setSeoData(result.seo)
        } else {
          // Use existing SEO data or generate defaults
          const defaultSEO = generateProductSEODefaults(product)
          setSeoData(product.seo || defaultSEO)
        }
      } else {
        // Fallback to local data or defaults
        const defaultSEO = generateProductSEODefaults(product)
        setSeoData(product.seo || defaultSEO)
      }
    } catch (error) {
      console.error('Error loading SEO data:', error)
      // Fallback to local data or defaults
      const defaultSEO = generateProductSEODefaults(product)
      setSeoData(product.seo || defaultSEO)
    }
  }

  const handleSaveSEO = async () => {
    if (!seoData || !selectedProduct || saving) return

    const validation = validateProductSEO(seoData)
    setValidationErrors(validation.errors)
    setValidationWarnings(validation.warnings || [])
    
    if (!validation.isValid) {
      return
    }

    try {
      setSaving(true)
      // Make API call to save the SEO data
      const response = await fetch(`/api/admin/seo/products?productId=${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      })

      if (!response.ok) {
        throw new Error('Failed to save SEO data')
      }

      // Update the product in the local state
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, seo: seoData }
          : p
      ))

      setSaved(true)
      setValidationErrors([])
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsEditing(false)
        setSaved(false)
      }, 2000)
    } catch (error) {
      console.error('Error saving SEO data:', error)
      setValidationErrors(['Có lỗi xảy ra khi lưu dữ liệu SEO'])
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedProduct(null)
    setSeoData(null)
    setValidationErrors([])
    setValidationWarnings([])
    setSaved(false)
  }

  const updateSEOField = (field: keyof ProductSEO, value: string | boolean | string[] | Record<string, unknown>) => {
    if (!seoData) return
    setSeoData({ ...seoData, [field]: value })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý SEO sản phẩm</h1>
        <p className="text-gray-600">Tối ưu hóa SEO cho từng sản phẩm riêng biệt</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-video relative bg-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {product.seo ? (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    SEO OK
                  </div>
                ) : (
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                    Chưa SEO
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.brand} • {product.category}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSEO(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa SEO"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`/san-pham/${product.slug}`, '_blank')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Xem sản phẩm"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEO Edit Modal */}
      {isEditing && selectedProduct && seoData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa SEO</h2>
                  <p className="text-gray-600">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Lỗi validation</h3>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Cảnh báo SEO</h3>
                  </div>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {saved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Đã lưu thành công!</span>
                  </div>
                </div>
              )}

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={seoData.metaTitle || ''}
                  onChange={(e) => updateSEOField('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tiêu đề SEO (10-60 ký tự)"
                />
                <SEOHelp field="metaTitle" currentValue={seoData.metaTitle || ''} />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={seoData.metaDescription || ''}
                  onChange={(e) => updateSEOField('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả SEO (50+ ký tự, tối ưu 120-160)"
                />
                <SEOHelp field="metaDescription" currentValue={seoData.metaDescription || ''} />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={(seoData.keywords || []).join(', ')}
                  onChange={(e) => updateSEOField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                />
                <SEOHelp field="keywords" currentValue={seoData.keywords || []} />
              </div>

              {/* OpenGraph */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={seoData.ogTitle || ''}
                    onChange={(e) => updateSEOField('ogTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tiêu đề cho social media"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={seoData.ogImage || ''}
                    onChange={(e) => updateSEOField('ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL hình ảnh social media"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description
                </label>
                <textarea
                  value={seoData.ogDescription || ''}
                  onChange={(e) => updateSEOField('ogDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả cho social media"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={seoData.canonicalUrl || ''}
                  onChange={(e) => updateSEOField('canonicalUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/san-pham/slug-san-pham"
                />
              </div>

              {/* No Index */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={seoData.noIndex || false}
                  onChange={(e) => updateSEOField('noIndex', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="noIndex" className="text-sm font-medium text-gray-700">
                  Không cho phép index (noindex)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSEO}
                disabled={saving}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu SEO'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
