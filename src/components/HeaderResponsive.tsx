'use client'

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Search, Phone, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '@/contexts/SettingsContext'

interface Brand {
  id: string
  name: string
  slug: string
}

export default function HeaderResponsive() {
  const { settings } = useSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { 
      name: 'Sản phẩm', 
      href: '/products',
      hasSubmenu: true
    },
    { name: 'Thương hiệu', href: '/brands' },
    { name: 'Liên hệ', href: '/contact' },
  ]

  // Load brands
  useEffect(() => {
    const loadBrands = async () => {
      try {
        console.log('HeaderResponsive: Loading brands...')
        const brandsRes = await fetch('/api/admin/brands')
        console.log('HeaderResponsive: Brands response status:', brandsRes.status)
        
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          console.log('HeaderResponsive: Brands data:', brandsData)
          if (brandsData.success && brandsData.data) {
            console.log('HeaderResponsive: Setting brands from data.data:', brandsData.data)
            setBrands(brandsData.data)
          } else {
            console.log('HeaderResponsive: No brands found in response')
          }
        }
      } catch (error) {
        console.error('HeaderResponsive: Error loading brands:', error)
      }
    }

    loadBrands()
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  // Animation variants

  const searchVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
    }
  }

  return (
    <motion.header 
      className={`bg-white shadow-md sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-lg' : 'py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <motion.div 
                className={`bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                }`}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`text-white font-bold ${isScrolled ? 'text-lg' : 'text-xl'}`}>TĐ</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className={`font-bold text-gray-900 transition-all duration-300 ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`}>Tiến Đạt Audio</h1>
                <p className="text-xs text-gray-600 hidden lg:block">Thiết bị âm thanh Quảng Ngãi</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">Tiến Đạt Audio</h1>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                className="relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>{item.name}</span>
                  {item.hasSubmenu && <ChevronDown className="h-4 w-4" />}
                </Link>
                
                {/* Brands Submenu */}
                {item.hasSubmenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="p-4">
                      <div className="mb-3">
                        <Link 
                          href="/products"
                          className="block text-base font-medium text-gray-900 hover:text-blue-600 transition-colors pb-3 border-b border-gray-100"
                        >
                          Tất cả sản phẩm
                        </Link>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Thương hiệu</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {brands.slice(0, 8).map(brand => (
                            <Link
                              key={brand.id}
                              href={`/products?brand_id=${encodeURIComponent(brand.id)}`}
                              className="block px-2 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                        {brands.length === 0 && (
                          <p className="text-sm text-gray-500">Đang tải thương hiệu...</p>
                        )}
                        {brands.length > 8 && (
                          <Link
                            href="/brands"
                            className="block mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Xem tất cả thương hiệu →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    variants={searchVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-lg border p-4 z-50"
                  >
                    <form onSubmit={handleSearch} className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Tìm kiếm
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsSearchOpen(false)}
                          className="px-4"
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact (hidden on mobile) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex items-center space-x-2 text-blue-600"
            >
              <Link 
                href={`tel:+84${settings?.contactPhone?.replace(/^0/, '') || '123456789'}`}
                className="flex items-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <div className="text-sm">
                  <div className="font-semibold">{settings?.contactPhone || '0123.456.789'}</div>
                </div>
              </Link>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="py-4 space-y-2 border-t">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.hasSubmenu && (
                      <div className="ml-4 mt-2 space-y-2">
                        <Link
                          href="/products"
                          className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Tất cả sản phẩm
                        </Link>
                        
                        <div className="space-y-1">
                          <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</p>
                          {brands.slice(0, 6).map(brand => (
                            <Link
                              key={brand.id}
                              href={`/products?brand_id=${encodeURIComponent(brand.id)}`}
                              className="block px-4 py-1 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {brand.name}
                            </Link>
                          ))}
                          {brands.length > 6 && (
                            <Link
                              href="/brands"
                              className="block px-4 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Xem tất cả →
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Mobile contact */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navigation.length * 0.1 }}
                  className="px-4 py-3 border-t"
                >
                  <div className="flex items-center space-x-3 text-blue-600">
                    <Phone className="h-5 w-5" />
                    <Link href={`tel:+84${settings?.contactPhone?.replace(/^0/, '') || '123456789'}`}>
                      <div>
                        <div className="font-semibold">Hotline: {settings?.contactPhone || '0123.456.789'}</div>
                        <div className="text-sm text-gray-600">Hỗ trợ 24/7</div>
                      </div>
                    </Link>
                  </div>
                </motion.div>

                {/* Mobile search */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (navigation.length + 1) * 0.1 }}
                  className="px-4 pt-2"
                >
                  <form onSubmit={handleSearch} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Tìm kiếm
                    </Button>
                  </form>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
