'use client'

import { useThemeColors } from '@/contexts/ThemeContext'

export default function ThemeDemo() {
  const colors = useThemeColors()

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
        Demo Theme Colors
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Primary Color */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-sm"
            style={{ backgroundColor: colors.primary }}
          />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Primary</p>
          <p className="text-xs" style={{ color: colors.textLight }}>Màu chính</p>
        </div>

        {/* Secondary Color */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-sm"
            style={{ backgroundColor: colors.secondary }}
          />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Secondary</p>
          <p className="text-xs" style={{ color: colors.textLight }}>Màu phụ</p>
        </div>

        {/* Accent Color */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-sm"
            style={{ backgroundColor: colors.accent }}
          />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Accent</p>
          <p className="text-xs" style={{ color: colors.textLight }}>Màu nhấn</p>
        </div>

        {/* Success Color */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-sm"
            style={{ backgroundColor: colors.success }}
          />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Success</p>
          <p className="text-xs" style={{ color: colors.textLight }}>Thành công</p>
        </div>
      </div>

      {/* Buttons Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Demo Buttons
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.primary }}
          >
            Primary Button
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.secondary }}
          >
            Secondary Button
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.accent }}
          >
            Accent Button
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg font-medium border-2 hover:opacity-80 transition-opacity"
            style={{ 
              color: colors.primary, 
              borderColor: colors.primary,
              backgroundColor: colors.background
            }}
          >
            Outline Button
          </button>
        </div>
      </div>

      {/* Cards Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Demo Cards
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="p-6 rounded-lg shadow-sm border"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
              Card Title
            </h4>
            <p style={{ color: colors.textLight }}>
              This is a demo card showing how the theme colors are applied to different elements.
            </p>
          </div>
          
          <div 
            className="p-6 rounded-lg shadow-sm"
            style={{ backgroundColor: colors.primary }}
          >
            <h4 className="font-semibold mb-2 text-white">
              Primary Card
            </h4>
            <p className="text-white opacity-90">
              This card uses the primary color as background.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Demo */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Demo Alerts
        </h3>
        
        <div 
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: `${colors.success}20`,
            borderLeftColor: colors.success
          }}
        >
          <p style={{ color: colors.success }}>
            ✓ Theme đã được áp dụng thành công!
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: `${colors.warning}20`,
            borderLeftColor: colors.warning
          }}
        >
          <p style={{ color: colors.warning }}>
            ⚠ Cảnh báo: Thay đổi theme sẽ ảnh hưởng đến toàn bộ website.
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: `${colors.error}20`,
            borderLeftColor: colors.error
          }}
        >
          <p style={{ color: colors.error }}>
            ✗ Lỗi: Không thể tải theme.
          </p>
        </div>
      </div>
    </div>
  )
}
