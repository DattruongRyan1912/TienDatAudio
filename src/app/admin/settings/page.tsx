"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Save,
    Store,
    Mail,
    Globe,
    Bell,
    Shield,
    Palette,
    Loader2,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useNotification } from '@/hooks/useNotification'

const tabs = [
    { id: 'general', name: 'Chung', icon: Settings },
    { id: 'store', name: 'Cửa hàng', icon: Store },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'seo', name: 'SEO', icon: Globe },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'appearance', name: 'Giao diện', icon: Palette },
];

export default function SettingsPage() {
    const { showSuccess, showError } = useNotification()
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { reloadSettings } = useSettings();
    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        businessHours: '',
        siteUrl: '',
        socialMedia: {
            facebook: '',
            youtube: '',
            instagram: '',
            tiktok: ''
        }
    });

    // Load settings from API
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSettings(result.data);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showSuccess('Lưu cài đặt thành công!');
                    // Reload to get updated data
                    await loadSettings();
                    // Reload settings context to apply changes globally
                    await reloadSettings();
                } else {
                    showError('Lỗi', result.message);
                }
            } else {
                showError('Lỗi khi lưu cài đặt');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showError('Lỗi khi lưu cài đặt');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Cài đặt"
                description="Quản lý cấu hình hệ thống"
                breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Cài đặt" }]}
            />

            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="px-6">
                        <div className="flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Đang tải cài đặt...</span>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Thông tin chung</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên website
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.siteName || ''}
                                                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email liên hệ
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.contactEmail || ''}
                                                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô tả website
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={settings.siteDescription || ''}
                                            onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL website
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.siteUrl || ''}
                                            onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://tiendataudio.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'store' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cửa hàng</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                value={settings.contactPhone || ''}
                                                onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giờ làm việc
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.businessHours || ''}
                                                onChange={(e) => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="8:00 - 22:00 (Thứ 2 - Chủ nhật)"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.address || ''}
                                            onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900">Mạng xã hội</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Facebook
                                                </label>
                                                <input
                                                    type="url"
                                                    value={settings.socialMedia?.facebook || ''}
                                                    onChange={(e) => setSettings(prev => ({ 
                                                        ...prev, 
                                                        socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="https://facebook.com/tiendataudio"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    YouTube
                                                </label>
                                                <input
                                                    type="url"
                                                    value={settings.socialMedia?.youtube || ''}
                                                    onChange={(e) => setSettings(prev => ({ 
                                                        ...prev, 
                                                        socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="https://youtube.com/@tiendataudio"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab !== 'general' && activeTab !== 'store' && (
                                <div className="text-center py-12">
                                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chức năng đang phát triển</h3>
                                    <p className="mt-1 text-sm text-gray-500">Tab &quot;{tabs.find(t => t.id === activeTab)?.name}&quot; sẽ được hoàn thiện trong phiên bản tiếp theo</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
