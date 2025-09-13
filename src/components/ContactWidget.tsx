'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Facebook, 
  X,
  Copy,
  Check
} from 'lucide-react'

interface ContactOption {
  id: string
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  action: 'call' | 'email' | 'url' | 'copy'
  description: string
}

const contactOptions: ContactOption[] = [
  {
    id: 'phone',
    label: 'Hotline',
    value: '0932576952',
    icon: Phone,
    color: 'bg-green-500 hover:bg-green-600',
    action: 'call',
    description: 'Gọi ngay để được tư vấn'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    value: 'https://facebook.com/tiendataudio',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    action: 'url',
    description: 'Nhắn tin qua Facebook'
  },
  {
    id: 'email',
    label: 'Email',
    value: 'contact@tiendataudio.com',
    icon: Mail,
    color: 'bg-red-500 hover:bg-red-600',
    action: 'email',
    description: 'Gửi email cho chúng tôi'
  }
]

interface ContactWidgetProps {
  productName?: string
  className?: string
}

export default function ContactWidget({ productName, className = '' }: ContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleContactAction = (option: ContactOption) => {
    const subject = productName ? `Tư vấn sản phẩm: ${productName}` : 'Tư vấn thiết bị âm thanh'
    
    switch (option.action) {
      case 'call':
        window.open(`tel:${option.value}`)
        break
      case 'email':
        window.open(`mailto:${option.value}?subject=${encodeURIComponent(subject)}`)
        break
      case 'url':
        window.open(option.value, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(option.value)
        setCopiedItem(option.id)
        setTimeout(() => setCopiedItem(null), 2000)
        break
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Contact Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 shadow-lg"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Liên hệ tư vấn
      </Button>

      {/* Contact Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Contact Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Liên hệ với chúng tôi</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  Chọn phương thức liên hệ phù hợp
                </p>
              </div>

              {/* Contact Options */}
              <div className="p-2">
                {contactOptions.map((option) => {
                  const IconComponent = option.icon
                  const isCopied = copiedItem === option.id
                  
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContactAction(option)}
                      className="w-full flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 ${option.color} rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 flex items-center">
                          {option.label}
                          {option.action === 'copy' && (
                            <div className="ml-2">
                              {isCopied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                        <div className="text-sm font-mono text-blue-600 mt-1">{option.value}</div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
                💬 Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
