import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  contactPhone: string
  address: string
  businessHours: string
  logo: string
  favicon: string
  socialMedia: {
    facebook: string
    youtube: string
    instagram: string
    tiktok: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage: string
  }
  smtp: {
    host: string
    port: number
    username: string
    password: string
    secure: boolean
  }
  analytics: {
    googleAnalyticsId: string
    facebookPixelId: string
    googleTagManagerId: string
  }
  updatedAt: string
}

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(SETTINGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load settings from file
const loadSettings = (): Partial<SiteSettings> => {
  ensureDataDir()
  if (fs.existsSync(SETTINGS_FILE)) {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  }
  return {}
}

// Save settings to file
const saveSettings = (settings: SiteSettings) => {
  ensureDataDir()
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const settings = loadSettings()
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error in settings GET:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải cài đặt' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { settings } = await request.json()
    
    if (!settings) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu cài đặt là bắt buộc' },
        { status: 400 }
      )
    }

    const updatedSettings: SiteSettings = {
      ...settings,
      updatedAt: new Date().toISOString()
    }

    saveSettings(updatedSettings)

    return NextResponse.json({
      success: true,
      message: 'Lưu cài đặt thành công',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error in settings POST:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lưu cài đặt' },
      { status: 500 }
    )
  }
}
