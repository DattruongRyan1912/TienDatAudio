'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  icon
}: ConfirmDialogProps) {
  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'info':
        return <Check className="w-6 h-6 text-blue-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        }
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-100'
        }
      case 'info':
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-100'
        }
      default:
        return {
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
          iconBg: 'bg-gray-100'
        }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-full ${colors.iconBg} flex-shrink-0`}>
                    {getIcon()}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {message}
                    </p>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[80px]"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`min-w-[80px] ${colors.confirmButton}`}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
