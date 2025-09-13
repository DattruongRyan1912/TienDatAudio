'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface SEOHelpProps {
  field: 'metaTitle' | 'metaDescription' | 'keywords'
  currentValue?: string | string[]
}

export default function SEOHelp({ field, currentValue }: SEOHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const guidelines = {
    metaTitle: {
      title: 'Meta Title',
      description: 'Tiêu đề hiển thị trên kết quả tìm kiếm Google',
      min: 10,
      max: 60,
      optimal: 50,
      tips: [
        'Bao gồm tên sản phẩm và thương hiệu',
        'Thêm từ khóa chính (bluetooth, chống ồn, v.v.)',
        'Kết thúc với tên cửa hàng',
        'Tránh lặp từ khóa quá nhiều'
      ]
    },
    metaDescription: {
      title: 'Meta Description',
      description: 'Mô tả hiển thị dưới title trên Google',
      min: 50,
      max: 160,
      optimal: 130,
      tips: [
        'Tối thiểu 50 ký tự để có ý nghĩa',
        'Tối ưu nhất 120-160 ký tự',
        'Mô tả ngắn gọn tính năng chính',
        'Bao gồm ưu đãi (✓ Chính hãng ✓ Bảo hành)',
        'Thêm thông tin giá cả',
        'Sử dụng call-to-action hấp dẫn'
      ]
    },
    keywords: {
      title: 'Keywords',
      description: 'Từ khóa giúp Google hiểu nội dung trang',
      min: 1,
      max: 10,
      optimal: 5,
      tips: [
        'Tên sản phẩm chính xác',
        'Tên thương hiệu + loại sản phẩm',
        'Tính năng chính (bluetooth, chống nước)',
        'Từ khóa long-tail',
        'Tránh keyword stuffing'
      ]
    }
  }

  const guide = guidelines[field]
  
  const getStatus = () => {
    if (field === 'keywords') {
      const count = Array.isArray(currentValue) ? currentValue.length : 0
      if (count === 0) return { type: 'error', message: 'Chưa có từ khóa' }
      if (count < guide.min) return { type: 'error', message: `Cần ít nhất ${guide.min} từ khóa` }
      if (count > guide.max) return { type: 'warning', message: `Quá nhiều từ khóa (${count}/${guide.max})` }
      if (count <= guide.optimal) return { type: 'success', message: `Tốt (${count} từ khóa)` }
      return { type: 'warning', message: `Nhiều từ khóa (${count}/${guide.max})` }
    } else {
      const length = typeof currentValue === 'string' ? currentValue.length : 0
      if (length === 0) return { type: 'error', message: 'Chưa nhập nội dung' }
      if (length < guide.min) return { type: 'error', message: `Quá ngắn (${length}/${guide.min}+)` }
      if (length > guide.max) return { type: 'error', message: `Quá dài (${length}/${guide.max})` }
      if (field === 'metaDescription' && length < 120) {
        return { type: 'warning', message: `Nên dài hơn (${length}/120+)` }
      }
      if (length <= guide.optimal) return { type: 'success', message: `Tốt (${length} ký tự)` }
      return { type: 'warning', message: `Gần giới hạn (${length}/${guide.max})` }
    }
  }

  const status = getStatus()

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status.type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm ${getStatusColor()}`}>{status.message}</span>
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Hướng dẫn</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
          
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Độ dài:</h5>
            <div className="text-sm text-gray-600">
              {field === 'keywords' ? (
                <span>Tối thiểu {guide.min}, tối đa {guide.max}, tối ưu {guide.optimal} từ khóa</span>
              ) : (
                <span>Tối thiểu {guide.min}, tối đa {guide.max}, tối ưu {guide.optimal} ký tự</span>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Lời khuyên:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
