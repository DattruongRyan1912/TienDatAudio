'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Filter, ChevronDown, Grid, List, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { getProducts, type Product } from '@/lib/data'

interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean | null
  featured: boolean | null
  bestseller: boolean | null
}

interface SortOption {
  key: string
  label: string
  value: string
}

const sortOptions: SortOption[] = [
  { key: 'newest', label: 'Mới nhất', value: 'newest' },
  { key: 'oldest', label: 'Cũ nhất', value: 'oldest' },
  { key: 'price-low', label: 'Giá thấp đến cao', value: 'price-asc' },
  { key: 'price-high', label: 'Giá cao đến thấp', value: 'price-desc' },
  { key: 'name-asc', label: 'Tên A-Z', value: 'name-asc' },
  { key: 'name-desc', label: 'Tên Z-A', value: 'name-desc' }
]

function ProductSearchContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false) // Changed default to false for mobile-first
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: [0, 50000000],
    inStock: null,
    featured: null,
    bestseller: null
  })

  // Get unique values for filters
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])

  useEffect(() => {
    const query = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const brand = searchParams.get('brand') || ''
    const brand_id = searchParams.get('brand_id') || ''
    
    setSearchQuery(query)
    
    // Apply filters from URL parameters
    setFilters(prev => ({
      ...prev,
      categories: category ? [category] : [],
      brands: brand ? [brand] : (brand_id ? [brand_id] : [])
    }))
    
    loadProducts()
  }, [searchParams])

  // Close filter on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setShowFilters(true)
      } else {
        setShowFilters(false)
      }
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        product.category && filters.categories.includes(product.category)
      )
    }

    // Brand filter - support both brand names and brand IDs
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        (product.brand && filters.brands.includes(product.brand)) ||
        (product.brand_id && filters.brands.includes(product.brand_id))
      )
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Stock filter
    if (filters.inStock !== null) {
      filtered = filtered.filter(product => product.inStock === filters.inStock)
    }

    // Featured filter
    if (filters.featured !== null) {
      filtered = filtered.filter(product => product.featured === filters.featured)
    }

    // Bestseller filter
    if (filters.bestseller !== null) {
      filtered = filtered.filter(product => product.bestseller === filters.bestseller)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.salePrice || a.price) - (b.salePrice || b.price)
        case 'price-desc':
          return (b.salePrice || b.price) - (a.salePrice || a.price)
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, filters, sortBy])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const allProducts = await getProducts()
      setProducts(allProducts)
      
      // Load categories and brands from APIs
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands')
      ])
      
      if (categoriesRes.ok && brandsRes.ok) {
        const categoriesData = await categoriesRes.json()
        const brandsData = await brandsRes.json()
        setAvailableCategories(categoriesData.map((cat: { name: string }) => cat.name))
        setAvailableBrands(brandsData.map((brand: { name: string }) => brand.name))
      }
      
      // Set price range
      const prices = allProducts.map(p => p.salePrice || p.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      setPriceRange([minPrice, maxPrice])
      setFilters(prev => ({ ...prev, priceRange: [minPrice, maxPrice] }))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: boolean | number[] | null) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleBrandToggle = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: priceRange,
      inStock: null,
      featured: null,
      bestseller: null
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getPageTitle = () => {
    if (searchQuery) {
      return `Kết quả tìm kiếm cho "${searchQuery}"`
    }
    
    const categoryFilter = filters.categories[0]
    const brandFilter = filters.brands[0]
    
    if (categoryFilter && brandFilter) {
      return `${brandFilter} - ${categoryFilter}`
    } else if (categoryFilter) {
      return `Danh mục: ${categoryFilter}`
    } else if (brandFilter) {
      return `Thương hiệu: ${brandFilter}`
    }
    
    return 'Tất cả sản phẩm'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Tìm thấy {filteredProducts.length} sản phẩm
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline">Hiển thị:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[140px]"
                >
                  {sortOptions.map(option => (
                    <option key={option.key} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Sidebar Filters - Mobile Drawer */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed lg:sticky top-0 lg:top-6 left-0 w-full lg:w-80 h-full lg:h-fit bg-white lg:rounded-lg shadow-sm p-4 lg:p-6 z-50 lg:z-auto overflow-y-auto lg:overflow-visible"
              >
                {/* Mobile close button */}
                <div className="flex lg:hidden items-center justify-between mb-4 pb-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="hidden lg:flex text-lg font-semibold text-gray-900 items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Bộ lọc
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Danh mục</h3>
                    <div className="space-y-2">
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Thương hiệu</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Khoảng giá</h3>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatPrice(filters.priceRange[0])}</span>
                        <span>{formatPrice(filters.priceRange[1])}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Từ"
                          value={filters.priceRange[0]}
                          onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Đến"
                          value={filters.priceRange[1]}
                          onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || priceRange[1]])}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Trạng thái</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.inStock === true}
                          onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : null)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Còn hàng</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.featured === true}
                          onChange={(e) => handleFilterChange('featured', e.target.checked ? true : null)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.bestseller === true}
                          onChange={(e) => handleFilterChange('bestseller', e.target.checked ? true : null)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Bán chạy</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Products */}
            <div className="flex-1 lg:min-w-0">
              {/* Mobile filter backdrop */}
              {showFilters && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div 
                  className={
                    viewMode === 'grid'
                      ? `grid gap-3 md:gap-4 lg:gap-6 ${
                          showFilters 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                        }`
                      : 'space-y-3 md:space-y-4'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12 bg-white rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-gray-500 text-lg mb-2">
                    {searchQuery 
                      ? `Không tìm thấy sản phẩm nào cho "${searchQuery}"`
                      : 'Không có sản phẩm nào phù hợp với bộ lọc'
                    }
                  </div>
                  <p className="text-gray-400">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductSearchContent />
    </Suspense>
  )
}
