"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category, Brand } from "@/lib/data"

interface ProductFilterProps {
  categories: Category[]
  brands: Brand[]
  currentFilters: {
    category?: string
    brand?: string
    search?: string
    priceRange?: [number, number]
  }
}

export default function ProductFilter({ categories, brands, currentFilters }: ProductFilterProps) {
  const router = useRouter()
  
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '')
  const [selectedBrand, setSelectedBrand] = useState(currentFilters.brand || '')
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '')
  const [priceMin, setPriceMin] = useState(currentFilters.priceRange?.[0]?.toString() || '')
  const [priceMax, setPriceMax] = useState(currentFilters.priceRange?.[1]?.toString() || '')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const updateFilters = () => {
    const params = new URLSearchParams()
    
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedBrand) params.set('brand', selectedBrand)
    if (searchQuery) params.set('search', searchQuery)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)

    router.push(`/san-pham?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSearchQuery('')
    setPriceMin('')
    setPriceMax('')
    router.push('/san-pham')
  }

  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery || priceMin || priceMax

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              {[selectedCategory, selectedBrand, searchQuery, priceMin || priceMax].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`
        lg:block bg-white rounded-lg border border-gray-200 p-6 space-y-6
        ${showMobileFilter ? 'block' : 'hidden'}
      `}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          )}
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && updateFilters()}
              placeholder="Tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thương hiệu
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá (VNĐ)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Từ"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Đến"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button onClick={updateFilters} className="w-full">
          Áp dụng bộ lọc
        </Button>

        {/* Quick Price Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá phổ biến
          </label>
          <div className="space-y-2">
            {[
              { label: "Dưới 2 triệu", min: 0, max: 2000000 },
              { label: "2 - 5 triệu", min: 2000000, max: 5000000 },
              { label: "5 - 10 triệu", min: 5000000, max: 10000000 },
              { label: "Trên 10 triệu", min: 10000000, max: 999999999 },
            ].map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPriceMin(range.min.toString())
                  setPriceMax(range.max.toString())
                }}
                className="w-full justify-start text-sm"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
