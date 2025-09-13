'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Facebook,
    Instagram,
    Youtube,
    Save,
    Smartphone
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageHeader from '@/components/ui/PageHeader'
import FormField from '@/components/ui/FormField'
import Alert from '@/components/ui/Alert'

interface ContactInfo {
    storeName: string
    phone: string
    hotline: string
    email: string
    address: string
    workingHours: string
    description: string
    socialMedia: {
        facebook: string
        instagram: string
        youtube: string
    }
    mapEmbedUrl: string
}

const defaultContactInfo: ContactInfo = {
    storeName: 'Tiến Đạt Audio',
    phone: '0123-456-789',
    hotline: '0987-654-321',
    email: 'contact@tiendataudio.com',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    workingHours: 'Thứ 2 - Chủ nhật: 8:00 - 22:00',
    description: 'Chuyên cung cấp các thiết bị âm thanh chất lượng cao với giá cả phải chăng.',
    socialMedia: {
        facebook: 'https://facebook.com/tiendataudio',
        instagram: 'https://instagram.com/tiendataudio',
        youtube: 'https://youtube.com/@tiendataudio'
    },
    mapEmbedUrl: ''
}

export default function ContactInfoPage() {
    const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAlert, setShowAlert] = useState(false)

    useEffect(() => {
        // Simulate API call to load contact info
        setTimeout(() => {
            setContactInfo(defaultContactInfo)
            setLoading(false)
        }, 1000)
    }, [])

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            setContactInfo(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof ContactInfo] as Record<string, unknown>),
                    [child]: value
                }
            }))
        } else {
            setContactInfo(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        } catch (error) {
            console.error('Error saving contact info:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Đang tải thông tin liên hệ..." />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="p-6">
                <PageHeader
                    title="Thông tin liên hệ"
                    description="Quản lý thông tin liên hệ của cửa hàng"
                    breadcrumb={[
                        { label: 'Admin', href: '/admin' },
                        { label: 'Thông tin liên hệ' }
                    ]}
                />

                {showAlert && (
                    <div className="mb-6">
                        <Alert
                            type="success"
                            message="Cập nhật thông tin liên hệ thành công!"
                            onClose={() => setShowAlert(false)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Phone className="h-5 w-5 mr-2" />
                                Thông tin cơ bản
                            </h2>

                            <div className="space-y-4">
                                <FormField
                                    label="Tên cửa hàng"
                                    type="text"
                                    value={contactInfo.storeName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('storeName', e.target.value)}
                                    required
                                />

                                <FormField
                                    label="Số điện thoại"
                                    type="tel"
                                    value={contactInfo.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                                    required
                                />

                                <FormField
                                    label="Hotline"
                                    type="tel"
                                    value={contactInfo.hotline}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hotline', e.target.value)}
                                />

                                <FormField
                                    label="Email"
                                    type="email"
                                    value={contactInfo.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                                    required
                                />

                                <FormField
                                    label="Địa chỉ"
                                    type="textarea"
                                    rows={3}
                                    value={contactInfo.address}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                                    required
                                />

                                <FormField
                                    label="Giờ làm việc"
                                    type="text"
                                    value={contactInfo.workingHours}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('workingHours', e.target.value)}
                                    placeholder="VD: Thứ 2 - Chủ nhật: 8:00 - 22:00"
                                />

                                <FormField
                                    label="Mô tả"
                                    type="textarea"
                                    rows={4}
                                    value={contactInfo.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả ngắn về cửa hàng..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mạng xã hội & Bản đồ */}
                    <div className="space-y-6">
                        {/* Social Media */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <Facebook className="h-5 w-5 mr-2" />
                                    Mạng xã hội
                                </h2>

                                <div className="space-y-4">
                                    <FormField
                                        label="Facebook"
                                        type="url"
                                        value={contactInfo.socialMedia.facebook}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('socialMedia.facebook', e.target.value)}
                                        placeholder="https://facebook.com/tiendataudio"
                                    />

                                    <FormField
                                        label="Instagram"
                                        type="url"
                                        value={contactInfo.socialMedia.instagram}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('socialMedia.instagram', e.target.value)}
                                        placeholder="https://instagram.com/tiendataudio"
                                    />

                                    <FormField
                                        label="YouTube"
                                        type="url"
                                        value={contactInfo.socialMedia.youtube}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('socialMedia.youtube', e.target.value)}
                                        placeholder="https://youtube.com/@tiendataudio"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Bản đồ
                                </h2>

                                <FormField
                                    label="Google Maps Embed URL"
                                    type="url"
                                    value={contactInfo.mapEmbedUrl}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mapEmbedUrl', e.target.value)}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    hint="Sao chép URL embed từ Google Maps"
                                />

                                {contactInfo.mapEmbedUrl && (
                                    <div className="mt-4">
                                        <iframe
                                            src={contactInfo.mapEmbedUrl}
                                            width="100%"
                                            height="200"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                        whileHover={{ scale: saving ? 1 : 1.02 }}
                        whileTap={{ scale: saving ? 1 : 0.98 }}
                    >
                        {saving ? (
                            <LoadingSpinner size="sm" color="white" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </motion.button>
                </div>

                {/* Preview */}
                <div className="mt-8 bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Xem trước thông tin liên hệ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <span>{contactInfo.phone}</span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Smartphone className="h-5 w-5 text-green-600" />
                                    <span>{contactInfo.hotline}</span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-red-600" />
                                    <span>{contactInfo.email}</span>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <span>{contactInfo.address}</span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <span>{contactInfo.workingHours}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-600 mb-4">{contactInfo.description}</p>

                                <div className="flex space-x-3">
                                    {contactInfo.socialMedia.facebook && (
                                        <a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                                            <Facebook className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                                        </a>
                                    )}
                                    {contactInfo.socialMedia.instagram && (
                                        <a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                                            <Instagram className="h-6 w-6 text-pink-600 hover:text-pink-700" />
                                        </a>
                                    )}
                                    {contactInfo.socialMedia.youtube && (
                                        <a href={contactInfo.socialMedia.youtube} target="_blank" rel="noopener noreferrer">
                                            <Youtube className="h-6 w-6 text-red-600 hover:text-red-700" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
