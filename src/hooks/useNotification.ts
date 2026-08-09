'use client'

import { useToast, toast, type Toast } from '@/components/ui/toast'
import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function useNotification() {
  const { addToast } = useToast()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const showSuccess = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast(toast.success(title, message, options))
  }

  const showError = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast(toast.error(title, message, options))
  }

  const showWarning = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast(toast.warning(title, message, options))
  }

  const showInfo = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast(toast.info(title, message, options))
  }

  const showConfirm = (options: ConfirmOptions, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      onConfirm
    })
  }

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    confirmDialog,
    closeConfirm
  }
}
