'use client'

import { Menu, User, Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface AdminHeaderProps {
  onMenuClick: () => void
  title?: string
  subtitle?: string
}

export default function AdminHeader({ onMenuClick, title = 'Admin Panel', subtitle }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <motion.button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search button */}
          <motion.button
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-5 w-5" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
          </motion.button>

          {/* User menu */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
