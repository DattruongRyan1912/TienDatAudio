'use client'

import { useSettings } from '@/contexts/SettingsContext'

export default function SettingsDisplay() {
  const { settings, isLoading } = useSettings()

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Settings Information</h2>
        <p>Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Settings Information</h2>
        <p className="text-red-600">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Current Settings Applied</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700">Site Information</h3>
          <p><span className="font-medium">Site Name:</span> {settings.siteName}</p>
          <p><span className="font-medium">Description:</span> {settings.siteDescription}</p>
          <p><span className="font-medium">URL:</span> {settings.siteUrl}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Contact Information</h3>
          <p><span className="font-medium">Phone:</span> {settings.contactPhone}</p>
          <p><span className="font-medium">Email:</span> {settings.contactEmail}</p>
          <p><span className="font-medium">Address:</span> {settings.address}</p>
          <p><span className="font-medium">Business Hours:</span> {settings.businessHours}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">Social Media</h3>
          <p><span className="font-medium">Facebook:</span> {settings.socialMedia.facebook}</p>
          <p><span className="font-medium">YouTube:</span> {settings.socialMedia.youtube}</p>
          <p><span className="font-medium">Instagram:</span> {settings.socialMedia.instagram}</p>
          <p><span className="font-medium">TikTok:</span> {settings.socialMedia.tiktok}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p><span className="font-medium">Last Updated:</span> {new Date(settings.updatedAt).toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </div>
  )
}
