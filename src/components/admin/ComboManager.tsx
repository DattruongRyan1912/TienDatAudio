'use client'

/* eslint-disable @next/next/no-img-element -- Admin thumbnails may use arbitrary legacy or uploaded URLs. */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, Search, Play, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ComboModal from './ComboModal'
import { getAllCombos, getAllProducts, type Combo, type Product } from '@/lib/data'
import { useNotification } from '@/hooks/useNotification'

export default function ComboManager() {
    const { showConfirm, showSuccess, showError } = useNotification()
    const [combos, setCombos] = useState<Combo[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const [combosData, productsData] = await Promise.all([
                getAllCombos(),
                getAllProducts()
            ])
            setCombos(combosData)
            setProducts(productsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCombos = combos.filter(combo => {
        const matchesSearch = combo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            combo.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || combo.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleCreateCombo = () => {
        setEditingCombo(null)
        setIsModalOpen(true)
    }

    const handleEditCombo = (combo: Combo) => {
        setEditingCombo(combo)
        setIsModalOpen(true)
    }

    const handleDeleteCombo = async (comboId: string) => {
        const comboToDelete = combos.find(c => c.id === comboId)
        showConfirm(
            {
                title: 'Xác nhận xóa',
                message: 'Bạn có chắc chắn muốn xóa combo này?',
                type: 'danger'
            },
            async () => {
                try {
                    const response = await fetch(`/api/admin/combos?id=${comboId}`, {
                        method: 'DELETE'
                    })
                    
                    if (!response.ok) {
                        throw new Error('Failed to delete combo')
                    }
                    
                    // Update local state
                    setCombos(combos.filter(c => c.id !== comboId))
                    showSuccess('Xóa thành công', `Combo "${comboToDelete?.title || 'N/A'}" đã được xóa!`)
                } catch (error) {
                    console.error('Error deleting combo:', error)
                    showError('Lỗi xóa combo', 'Không thể xóa combo. Vui lòng thử lại.')
                }
            }
        )
    }

    const handleSaveCombo = async (comboData: Partial<Combo>) => {
        try {
            if (editingCombo) {
                // Update existing combo
                const response = await fetch('/api/admin/combos', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...comboData,
                        id: editingCombo.id
                    })
                })
                
                if (!response.ok) {
                    throw new Error('Failed to update combo')
                }
                
                const result = await response.json()
                
                // Update local state
                setCombos(combos.map(c => 
                    c.id === editingCombo.id ? result.combo : c
                ))
                showSuccess('Cập nhật thành công', `Combo "${comboData.title}" đã được cập nhật!`)
            } else {
                // Create new combo
                const response = await fetch('/api/admin/combos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(comboData)
                })
                
                if (!response.ok) {
                    throw new Error('Failed to create combo')
                }
                
                const result = await response.json()
                
                // Update local state
                setCombos([result.combo, ...combos])
                showSuccess('Tạo thành công', `Combo "${comboData.title}" đã được tạo!`)
            }
            
            setIsModalOpen(false)
            setEditingCombo(null)
        } catch (error) {
            console.error('Error saving combo:', error)
            showError('Lỗi lưu combo', 'Không thể lưu combo. Vui lòng thử lại.')
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'draft': return 'bg-yellow-100 text-yellow-800'
            case 'archived': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Đang hoạt động'
            case 'draft': return 'Bản nháp'
            case 'archived': return 'Đã lưu trữ'
            default: return status
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Combo</h1>
                    <p className="text-gray-600">Tạo và quản lý các combo sản phẩm với giao diện reel</p>
                </div>
                <Button onClick={handleCreateCombo} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo combo mới
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm combo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Đã lưu trữ</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-600">Tổng combo</p>
                    <p className="text-2xl font-bold text-gray-900">{combos.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-green-600">
                        {combos.filter(c => c.status === 'active').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-600">Bản nháp</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {combos.filter(c => c.status === 'draft').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-600">Tổng lượt xem</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {combos.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Combo List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredCombos.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Combo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giá
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thống kê
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCombos.map((combo) => (
                                    <motion.tr
                                        key={combo.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={combo.thumbnail}
                                                        alt={combo.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        {combo.type === 'video' ? (
                                                            <Play className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <ImageIcon className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {combo.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {combo.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {combo.tags.slice(0, 2).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {combo.contentType === 'combo' ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">
                                                        {formatPrice(combo.comboPrice || 0)}
                                                    </p>
                                                    <p className="text-gray-500 line-through text-xs">
                                                        {formatPrice(combo.originalPrice || 0)}
                                                    </p>
                                                    <p className="text-green-600 text-xs font-medium">
                                                        Tiết kiệm {combo.savingsPercent || 0}%
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        Bài viết
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <p>👁️ {combo.views.toLocaleString()}</p>
                                                <p>❤️ {combo.likes.toLocaleString()}</p>
                                                <p>💬 {combo.comments.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(combo.status)}`}>
                                                {getStatusText(combo.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`/combos/${combo.slug}`, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditCombo(combo)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCombo(combo.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không tìm thấy combo nào</p>
                        <Button
                            onClick={handleCreateCombo}
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo combo đầu tiên
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ComboModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCombo}
                combo={editingCombo}
                products={products}
            />
        </div>
    )
}
