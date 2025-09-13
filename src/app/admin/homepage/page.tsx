'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Globe, Eye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import FormField from '@/components/ui/FormField'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  featuredProducts: boolean
  showBrands: boolean
  aboutSection: string
  contactInfo: boolean
}

const defaultContent: HomepageContent = {
  heroTitle: 'Tiến Đạt Audio - Thiết bị âm thanh chuyên nghiệp',
  heroSubtitle: 'Chuyên cung cấp các thiết bị âm thanh chất lượng cao với giá cả phải chăng.',
  heroButtonText: 'Xem sản phẩm',
  featuredProducts: true,
  showBrands: true,
  aboutSection: 'Với nhiều năm kinh nghiệm trong lĩnh vực âm thanh, Tiến Đạt Audio cam kết mang đến cho khách hàng những sản phẩm tốt nhất.',
  contactInfo: true
}

export default function HomepagePage() {
  const [content, setContent] = useState<HomepageContent>(defaultContent)
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Error saving homepage:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6">
    <div className="p-6">
        <PageHeader
          title="Quản lý trang chủ"
          description="Tùy chỉnh nội dung hiển thị trên trang chủ"
          breadcrumb={[
            { label: 'Admin', href: '/admin' },
            { label: 'Trang chủ' }
          ]}
        />

        {showAlert && (
          <div className="mb-6">
            <Alert
              type="success"
              message="Cập nhật trang chủ thành công!"
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Settings */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Banner chính
                </h2>

                <div className="space-y-4">
                  <FormField
                    label="Tiêu đề chính"
                    type="text"
                    value={content.heroTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(prev => ({...prev, heroTitle: e.target.value}))}
                    placeholder="Tiêu đề hiển thị trên banner..."
                  />

                  <FormField
                    label="Mô tả"
                    type="textarea"
                    rows={3}
                    value={content.heroSubtitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(prev => ({...prev, heroSubtitle: e.target.value}))}
                    placeholder="Mô tả ngắn về cửa hàng..."
                  />

                  <FormField
                    label="Text nút CTA"
                    type="text"
                    value={content.heroButtonText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(prev => ({...prev, heroButtonText: e.target.value}))}
                    placeholder="Văn bản hiển thị trên nút..."
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Phần giới thiệu
                </h2>

                <FormField
                  label="Nội dung giới thiệu"
                  type="textarea"
                  rows={4}
                  value={content.aboutSection}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(prev => ({...prev, aboutSection: e.target.value}))}
                  placeholder="Giới thiệu về cửa hàng..."
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-6">
            {/* Sections Display */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Hiển thị các phần
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Sản phẩm nổi bật
                    </label>
                    <input
                      type="checkbox"
                      checked={content.featuredProducts}
                      onChange={(e) => setContent(prev => ({...prev, featuredProducts: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Thương hiệu đối tác
                    </label>
                    <input
                      type="checkbox"
                      checked={content.showBrands}
                      onChange={(e) => setContent(prev => ({...prev, showBrands: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Thông tin liên hệ
                    </label>
                    <input
                      type="checkbox"
                      checked={content.contactInfo}
                      onChange={(e) => setContent(prev => ({...prev, contactInfo: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Xem trước
                </h2>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {content.heroTitle}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {content.heroSubtitle}
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      {content.heroButtonText}
                    </button>
                  </div>

                  {content.featuredProducts && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-500">📦 Sản phẩm nổi bật</p>
                    </div>
                  )}

                  {content.showBrands && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-500">🏢 Thương hiệu đối tác</p>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-700">{content.aboutSection}</p>
                  </div>

                  {content.contactInfo && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-500">📞 Thông tin liên hệ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-between items-center">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <Globe className="h-4 w-4 mr-2" />
            Xem trang chủ thực tế
          </a>

          <motion.button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </motion.button>
        </div>
      </div>
        </div>
    </div>
  )
}