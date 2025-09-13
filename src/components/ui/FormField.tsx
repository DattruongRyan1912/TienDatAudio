'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'

interface FormFieldProps {
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
  className?: string
  inputClassName?: string
  labelClassName?: string
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps & (
    | React.InputHTMLAttributes<HTMLInputElement>
    | React.TextareaHTMLAttributes<HTMLTextAreaElement>
    | React.SelectHTMLAttributes<HTMLSelectElement>
  )
>(({
  label,
  type = 'text',
  placeholder,
  required,
  error,
  hint,
  options,
  rows = 3,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${inputClassName}
  `

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={rows}
          placeholder={placeholder}
          className={baseInputClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === 'select' ? (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          className={baseInputClasses}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          placeholder={placeholder}
          className={baseInputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-sm text-red-600 flex items-center mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <p className="text-sm text-gray-500 mt-1">
          {hint}
        </p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField
