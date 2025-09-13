'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { Phone, Mail, MapPin, Clock, Facebook, Youtube, Instagram } from 'lucide-react'

interface ContactInfoProps {
  className?: string
}

export default function ContactInfo({ className = '' }: ContactInfoProps) {
  const { settings, isLoading } = useSettings()

  if (isLoading || !settings) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {settings.contactPhone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-blue-600" />
            <a href={`tel:${settings.contactPhone}`} className="hover:text-blue-600">
              {settings.contactPhone}
            </a>
          </div>
        )}

        {settings.contactEmail && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-blue-600" />
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-blue-600">
              {settings.contactEmail}
            </a>
          </div>
        )}

        {settings.address && (
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>{settings.address}</span>
          </div>
        )}

        {settings.businessHours && (
          <div className="flex items-start text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>{settings.businessHours}</span>
          </div>
        )}

        {settings.socialMedia && (
          <div className="flex items-center space-x-3 pt-2">
            {settings.socialMedia.facebook && (
              <a
                href={settings.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}

            {settings.socialMedia.youtube && (
              <a
                href={settings.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}

            {settings.socialMedia.instagram && (
              <a
                href={settings.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
