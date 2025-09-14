"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#2563eb',
  secondaryColor: '#f97316',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  fontFamily: 'Inter',
  borderRadius: '8px',
  spacing: '16px',
};

const colorPresets = [
  { name: 'Xanh dương', primary: '#3B82F6', secondary: '#6B7280' },
  { name: 'Xanh lá', primary: '#10B981', secondary: '#6B7280' },
  { name: 'Đỏ', primary: '#EF4444', secondary: '#6B7280' },
  { name: 'Tím', primary: '#8B5CF6', secondary: '#6B7280' },
  { name: 'Vàng', primary: '#F59E0B', secondary: '#6B7280' },
];

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Nunito',
];

export default function ThemePage() {
  const { theme: globalTheme, updateTheme: updateGlobalTheme } = useTheme();
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current theme on mount
  useEffect(() => {
    if (globalTheme) {
      setTheme({
        primaryColor: globalTheme.colors.primary,
        secondaryColor: globalTheme.colors.secondary,
        backgroundColor: globalTheme.colors.background,
        textColor: globalTheme.colors.text,
        fontFamily: globalTheme.typography.fontFamily.split(',')[0],
        borderRadius: '8px',
        spacing: '16px',
      });
    }
  }, [globalTheme]);

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  };

  const applyPreset = (preset: { primary: string; secondary: string }) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
    setSaved(false);
    setError(null);
  };

  const resetToDefault = () => {
    setTheme(defaultTheme);
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      if (!globalTheme) {
        throw new Error('Theme not loaded');
      }

      // Update using the theme context
      await updateGlobalTheme({
        colors: {
          ...globalTheme.colors,
          primary: theme.primaryColor,
          secondary: theme.secondaryColor,
          background: theme.backgroundColor,
          text: theme.textColor,
        },
        typography: {
          ...globalTheme.typography,
          fontFamily: `${theme.fontFamily}, system-ui, sans-serif`,
        }
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving theme:', error);
      setError('Không thể lưu theme. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý giao diện"
        description="Tùy chỉnh màu sắc và phong cách website"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Giao diện" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="space-y-6">
          {/* Color Presets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ màu có sẵn</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex space-x-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chỉnh màu sắc</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu chính
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu phụ
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu nền
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu chữ
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font chữ
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Theme đã được lưu thành công!</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </motion.button>
            <button
              onClick={resetToDefault}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Xem trước</h3>
            <div className="flex space-x-2">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => setPreviewDevice(device)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    previewDevice === device
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {getDeviceIcon(device)}
                  <span className="ml-2 capitalize">{device}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className={`transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 
                previewDevice === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
              }`}
            >
              <div
                className="p-6"
                style={{
                  backgroundColor: theme.backgroundColor,
                  fontFamily: theme.fontFamily,
                }}
              >
                <div className="text-center space-y-4">
                  <h1
                    className="text-3xl font-bold"
                    style={{ color: theme.textColor }}
                  >
                    Tiến Đạt Audio
                  </h1>
                  <p
                    className="text-lg"
                    style={{ color: theme.secondaryColor }}
                  >
                    Chuyên cung cấp thiết bị âm thanh chất lượng cao
                  </p>
                  <button
                    className="px-6 py-3 rounded-lg text-white font-medium"
                    style={{
                      backgroundColor: theme.primaryColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    Xem sản phẩm
                  </button>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: theme.secondaryColor + '40',
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: theme.textColor }}
                    >
                      Sản phẩm 1
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme.secondaryColor }}
                    >
                      Mô tả sản phẩm
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: theme.secondaryColor + '40',
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: theme.textColor }}
                    >
                      Sản phẩm 2
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme.secondaryColor }}
                    >
                      Mô tả sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
