import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

const THEME_FILE = path.join(process.cwd(), 'data', 'theme.json')

interface Theme {
  id: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textLight: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    small: string
    medium: string
    large: string
  }
}

// Ensure theme file exists
function ensureThemeFile() {
  if (!fs.existsSync(THEME_FILE)) {
    const defaultTheme = {
      id: 'default',
      colors: {
        primary: '#2563eb',
        secondary: '#f97316', 
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#111827',
        textLight: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem', 
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      layout: {
        maxWidth: '1200px',
        headerHeight: '80px',
        footerHeight: '200px',
        sidebarWidth: '280px',
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem', 
          lg: '2rem',
          xl: '3rem'
        },
        borderRadius: {
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem'
        }
      },
      branding: {
        siteName: 'Tiến Đạt Audio',
        tagline: 'Thiết bị âm thanh chất lượng cao',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        ogImage: '/images/og-default.jpg'
      },
      contact: {
        phone: '0934995657',
        email: 'contact@tiendataudio.com',
        address: '264 Phan Đình Phùng, Chánh Lộ, Quảng Ngãi, Việt Nam',
        workingHours: 'Thứ 2 - Chủ nhật: 08:00 - 22:00',
        socialLinks: {
          facebook: 'https://www.facebook.com/amthanhtiendat',
          instagram: 'https://instagram.com/tiendataudio',
          youtube: 'https://youtube.com/@tiendataudio',
          zalo: 'https://zalo.me/0934995657'
        }
      },
      features: {
        showHeader: true,
        showFooter: true,
        showSidebar: false,
        enableAnimations: true,
        enableDarkMode: false,
        enableSearch: true,
        enableCart: true,
        enableWishlist: true,
        enableComments: false,
        enableRating: true
      },
      seo: {
        googleAnalytics: '',
        googleTagManager: '',
        facebookPixel: '',
        metaVerification: {
          google: '',
          bing: '',
          yandex: ''
        }
      },
      performance: {
        enableImageOptimization: true,
        enableLazyLoading: true,
        enableCaching: true,
        enableCompression: true,
        enablePreloading: true
      },
      updatedAt: new Date().toISOString()
    }
    
    fs.writeFileSync(THEME_FILE, JSON.stringify(defaultTheme, null, 2))
  }
}

function getTheme() {
  try {
    ensureThemeFile()
    const data = fs.readFileSync(THEME_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading theme file:', error)
    return null
  }
}

function saveTheme(theme: Theme) {
  try {
    // Create backup
    if (fs.existsSync(THEME_FILE)) {
      const backupFile = THEME_FILE.replace('.json', `-backup-${Date.now()}.json`)
      fs.copyFileSync(THEME_FILE, backupFile)
    }

    fs.writeFileSync(THEME_FILE, JSON.stringify(theme, null, 2))
    return true
  } catch (error) {
    console.error('Error saving theme file:', error)
    return false
  }
}

// GET - Lấy cấu hình theme
export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const theme = getTheme()
    
    if (!theme) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình theme' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: theme
    })
  } catch (error) {
    console.error('Error in GET /api/admin/theme:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy cấu hình theme' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật cấu hình theme
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { theme } = await request.json()
    
    if (!theme) {
      return NextResponse.json(
        { success: false, message: 'Thiếu dữ liệu theme' },
        { status: 400 }
      )
    }

    // Update timestamp
    const updatedTheme = {
      ...theme,
      updatedAt: new Date().toISOString()
    }
    
    const saved = saveTheme(updatedTheme)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Lỗi khi lưu cấu hình theme' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình theme thành công',
      data: updatedTheme
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/theme:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật cấu hình theme' },
      { status: 500 }
    )
  }
}

// POST - Tạo backup theme
export async function POST() {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const theme = getTheme()
    
    if (!theme) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình theme' },
        { status: 404 }
      )
    }

    // Create backup
    const backupFile = THEME_FILE.replace('.json', `-backup-${Date.now()}.json`)
    fs.copyFileSync(THEME_FILE, backupFile)

    return NextResponse.json({
      success: true,
      message: 'Tạo backup theme thành công',
      backupFile: path.basename(backupFile)
    })
  } catch (error) {
    console.error('Error in POST /api/admin/theme:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo backup theme' },
      { status: 500 }
    )
  }
}
