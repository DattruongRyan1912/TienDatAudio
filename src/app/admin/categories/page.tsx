'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import Image from 'next/image'
import CategoryModal from '@/components/admin/CategoryModal'
import { useNotification } from '@/hooks/useNotification'
import ConfirmDialog from '@/components/ui/confirm-dialog'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  sortOrder: number
}

export default function CategoriesPage() {
  const { showSuccess, showError, showConfirm, confirmDialog, closeConfirm } = useNotification()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, searchQuery])

  const handleSave = useCallback(async (categoryData: Partial<Category>) => {
    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const url = editingCategory
        ? `/api/admin/categories?id=${editingCategory.id}`
        : '/api/admin/categories'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        await loadCategories()
        setIsModalOpen(false)
        setEditingCategory(null)
        showSuccess(editingCategory ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!')
      } else {
        const error = await response.json()
        showError('Có lỗi xảy ra', error.error || 'Không xác định')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      showError('Có lỗi xảy ra khi lưu danh mục')
    }
  }, [editingCategory, loadCategories])

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback(async (category: Category) => {
    showConfirm(
      {
        title: 'Xóa danh mục',
        message: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
        type: 'danger'
      },
      async () => {
        try {
          const response = await fetch(`/api/admin/categories?id=${category.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadCategories()
            showSuccess('Xóa danh mục thành công!')
          } else {
            const error = await response.json()
            showError('Có lỗi xảy ra', error.error || 'Không xác định')
          }
        } catch (error) {
          console.error('Error deleting category:', error)
          showError('Có lỗi xảy ra khi xóa danh mục')
        }
      }
    )
  }, [loadCategories, showConfirm, showSuccess, showError])

  const handleAdd = useCallback(() => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý danh mục</h1>
          <p className="text-gray-600">Thêm, sửa, xóa các danh mục sản phẩm</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-video relative bg-gray-100">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Thứ tự: {category.sortOrder}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Bắt đầu bằng việc thêm danh mục đầu tiên'
            }
          </p>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        onSave={handleSave}
        category={editingCategory}
      />

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
