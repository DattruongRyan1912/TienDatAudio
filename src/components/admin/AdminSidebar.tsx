'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  Package, 
  Tags, 
  MapPin, 
  Settings,
  Image,
  Search,
  BarChart3,
  Palette,
  FileText,
  MessageSquare,
  Globe,
  FolderOpen,
  Layers,
  Cloud,
  Sparkles
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  type?: 'item' | 'separator'
  category?: string
}

const navigation: NavigationItem[] = [
  // Dashboard
  { name: 'Dashboard', href: '/admin', icon: Home },
  
  // Separator
  { name: 'QUẢN LÝ SẢN PHẨM', href: '', icon: Package, type: 'separator' },
  
  // Quản lý sản phẩm
  { name: 'Sản phẩm', href: '/admin/products', icon: Package },
  { name: 'Combo Reel', href: '/admin/combos', icon: Layers },
  { name: 'Danh mục', href: '/admin/categories', icon: Tags },
  { name: 'Thương hiệu', href: '/admin/brands', icon: MapPin },
  { name: 'Hình ảnh', href: '/admin/images', icon: Image },
  
  // Separator
  { name: 'NỘI DUNG & MARKETING', href: '', icon: FileText, type: 'separator' },
  
  // Nội dung trang web
  { name: 'Bài viết', href: '/admin/posts', icon: FileText },
  { name: 'Trang chủ', href: '/admin/homepage', icon: Globe },
  { name: 'Liên hệ', href: '/admin/contacts', icon: MessageSquare },
  
  // Separator  
  { name: 'SEO & PHÂN TÍCH', href: '', icon: Search, type: 'separator' },
  
  // SEO & Marketing
  { name: 'SEO Content', href: '/admin/seo', icon: Search },
  { name: 'Keyword + GEO/AIO', href: '/admin/seo/strategy', icon: Sparkles },
  { name: 'SEO Dashboard', href: '/admin/seo/dashboard', icon: BarChart3 },
  
  // Separator
  { name: 'HỆ THỐNG', href: '', icon: Settings, type: 'separator' },
  
  // Hệ thống
  { name: 'Cloudinary Files', href: '/admin/cloudinary', icon: Cloud },
  { name: 'Theme Options', href: '/admin/theme', icon: Palette },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg font-bold text-gray-900">Tiến Đạt Audio</h1>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          // Render separator
          if (item.type === 'separator') {
            return (
              <div key={item.name} className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.name}
                </p>
              </div>
            )
          }
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
        {sidebarContent}
      </div>

      {/* Mobile sidebar with overlay */}
      {isOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="fixed inset-y-0 left-0 w-64 z-50 pt-16"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  )
}
