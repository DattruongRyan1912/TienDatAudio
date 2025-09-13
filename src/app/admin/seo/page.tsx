"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Globe,
  TrendingUp,
  FileText,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  Package,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface SEOContent {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  structuredData: Record<string, unknown>;
  metaRobots: string;
  canonicalUrl: string;
  h1: string;
  h2: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultPages = [
  { page: '/', name: 'Trang chủ' },
  { page: '/products', name: 'Trang sản phẩm' },
  { page: '/brands', name: 'Trang thương hiệu' },
  { page: '/contact', name: 'Trang liên hệ' },
  { page: '/about', name: 'Trang giới thiệu' },
];

export default function SEOPage() {
  const [seoContents, setSeoContents] = useState<SEOContent[]>([]);
  const [selectedSEO, setSelectedSEO] = useState<SEOContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load SEO contents on component mount
  useEffect(() => {
    loadSEOContents();
  }, []);

  const loadSEOContents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seo');
      const result = await response.json();
      
      if (result.success) {
        setSeoContents(result.data || []);
      } else {
        console.error('Error loading SEO contents:', result.message);
      }
    } catch (error) {
      console.error('Error loading SEO contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSEO) return;
    
    try {
      setSaving(true);
      const method = selectedSEO.id ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/seo', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seo: selectedSEO }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadSEOContents(); // Reload data
        setIsEditing(false);
        setIsAdding(false);
        setSelectedSEO(null);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving SEO:', error);
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (seoContent: SEOContent) => {
    setSelectedSEO(seoContent);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleAdd = () => {
    const newSEO: Partial<SEOContent> = {
      page: '',
      title: '',
      description: '',
      keywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '/images/og-default.jpg',
      structuredData: {},
      metaRobots: 'index,follow',
      canonicalUrl: '',
      h1: '',
      h2: [],
      isActive: true,
    };
    setSelectedSEO(newSEO as SEOContent);
    setIsAdding(true);
    setIsEditing(true);
  };

  const handleDelete = async (seoId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình SEO này?')) return;
    
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seoId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadSEOContents();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting SEO:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const updateSelectedSEO = (field: string, value: unknown) => {
    if (!selectedSEO) return;
    setSelectedSEO({ ...selectedSEO, [field]: value });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý SEO"
        description="Tối ưu hóa công cụ tìm kiếm cho website"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "SEO" }]}
      />

      {/* SEO Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/seo/products" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Sản phẩm</h3>
            <p className="text-gray-600 text-sm">Quản lý SEO cho từng sản phẩm riêng biệt</p>
          </div>
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-500">Sắp có</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Danh mục</h3>
          <p className="text-gray-600 text-sm">Tối ưu SEO cho các trang danh mục</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">Sắp có</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân tích SEO</h3>
          <p className="text-gray-600 text-sm">Báo cáo và thống kê hiệu quả SEO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO Pages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Cấu hình SEO</h3>
                <button 
                  onClick={handleAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm cấu hình
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
              ) : seoContents.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">Chưa có cấu hình SEO nào</p>
                  <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cấu hình đầu tiên
                  </button>
                </div>
              ) : (
                seoContents.map((seoContent) => (
                  <motion.div
                    key={seoContent.id}
                    className="p-6 hover:bg-gray-50"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{seoContent.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{seoContent.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-500">Trang: {seoContent.page}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            seoContent.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {seoContent.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {seoContent.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(seoContent)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(seoContent.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SEO Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Thống kê SEO</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Tổng cấu hình</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{seoContents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Đang hoạt động</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {seoContents.filter(p => p.isActive).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-gray-600">Tạm dừng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {seoContents.filter(p => !p.isActive).length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h4>
            <div className="space-y-3">
              <button 
                onClick={loadSEOContents}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới dữ liệu
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt SEO chung
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Search className="w-4 h-4 mr-2" />
                Kiểm tra SEO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedSEO && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isAdding ? 'Thêm cấu hình SEO' : 'Chỉnh sửa SEO'}
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trang</label>
                    {isAdding ? (
                      <select
                        value={selectedSEO.page}
                        onChange={(e) => updateSelectedSEO('page', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Chọn trang</option>
                        {defaultPages.map(page => (
                          <option key={page.page} value={page.page}>
                            {page.name} ({page.page})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={selectedSEO.page}
                        onChange={(e) => updateSelectedSEO('page', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <select
                      value={selectedSEO.isActive ? 'true' : 'false'}
                      onChange={(e) => updateSelectedSEO('isActive', e.target.value === 'true')}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tạm dừng</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề (Title)</label>
                  <input
                    type="text"
                    value={selectedSEO.title}
                    onChange={(e) => updateSelectedSEO('title', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Tiêu đề SEO của trang"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả (Description)</label>
                  <textarea
                    rows={3}
                    value={selectedSEO.description}
                    onChange={(e) => updateSelectedSEO('description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Mô tả ngắn gọn về trang"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Từ khóa</label>
                  <input
                    type="text"
                    value={selectedSEO.keywords.join(', ')}
                    onChange={(e) => updateSelectedSEO('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập từ khóa, cách nhau bằng dấu phẩy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">H1 Heading</label>
                  <input
                    type="text"
                    value={selectedSEO.h1}
                    onChange={(e) => updateSelectedSEO('h1', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Tiêu đề chính của trang"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">OG Title</label>
                    <input
                      type="text"
                      value={selectedSEO.ogTitle}
                      onChange={(e) => updateSelectedSEO('ogTitle', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Tiêu đề cho social media"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">OG Image</label>
                    <input
                      type="text"
                      value={selectedSEO.ogImage}
                      onChange={(e) => updateSelectedSEO('ogImage', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="/images/og-image.jpg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">OG Description</label>
                  <textarea
                    rows={2}
                    value={selectedSEO.ogDescription}
                    onChange={(e) => updateSelectedSEO('ogDescription', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Mô tả cho social media"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Robots</label>
                    <select
                      value={selectedSEO.metaRobots}
                      onChange={(e) => updateSelectedSEO('metaRobots', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="index,follow">Index, Follow</option>
                      <option value="noindex,follow">No Index, Follow</option>
                      <option value="index,nofollow">Index, No Follow</option>
                      <option value="noindex,nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                    <input
                      type="text"
                      value={selectedSEO.canonicalUrl}
                      onChange={(e) => updateSelectedSEO('canonicalUrl', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://example.com/page"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                    setSelectedSEO(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 inline" />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
