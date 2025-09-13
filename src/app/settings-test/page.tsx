'use client'

import { useSettings } from '@/contexts/SettingsContext'
import ContactInfo from '@/components/ContactInfo'
import SiteName from '@/components/SiteName'

export default function SettingsTestPage() {
  const { settings, isLoading } = useSettings()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Settings System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Site Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Thông tin Site</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Tên site: </span>
                <SiteName />
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Mô tả: </span>
                <span className="text-gray-600">{settings?.siteDescription || 'Chưa có mô tả'}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">URL: </span>
                <span className="text-gray-600">{settings?.siteUrl || 'Chưa cấu hình'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Thông tin liên hệ</h2>
          <ContactInfo />
        </div>

        {/* SEO Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">SEO Settings</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Site Name: </span>
                <span className="text-gray-600">{settings?.siteName || 'Chưa cấu hình'}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Site Description: </span>
                <span className="text-gray-600">{settings?.siteDescription || 'Chưa cấu hình'}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Site URL: </span>
                <span className="text-gray-600">{settings?.siteUrl || 'Chưa cấu hình'}</span>
              </div>
              
              <div className="text-sm text-gray-500 italic">
                SEO data is now managed separately in the admin panel
              </div>
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Analytics</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Google Analytics: </span>
                <span className="text-gray-600">
                  {settings?.analytics?.googleAnalyticsId || 'Chưa cấu hình'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Facebook Pixel: </span>
                <span className="text-gray-600">
                  {settings?.analytics?.facebookPixelId || 'Chưa cấu hình'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Google Tag Manager: </span>
                <span className="text-gray-600">
                  {settings?.analytics?.googleTagManagerId || 'Chưa cấu hình'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Data for Debugging */}
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Debug: Raw Settings Data</h2>
        <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
          {isLoading ? 'Loading...' : JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  )
}
