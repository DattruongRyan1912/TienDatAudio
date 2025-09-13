"use client";

import { useState } from "react";
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
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface SEOPage {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  url: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

const mockSEOPages: SEOPage[] = [
  {
    id: '1',
    title: 'Trang chủ - Tiến Đạt Audio',
    description: 'Chuyên cung cấp thiết bị âm thanh chất lượng cao, loa, tai nghe, micro chính hãng',
    keywords: ['loa', 'tai nghe', 'âm thanh', 'audio'],
    url: '/',
    status: 'active',
    lastUpdated: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Sản phẩm - Thiết bị âm thanh',
    description: 'Khám phá bộ sưu tập loa, tai nghe, micro chất lượng cao với giá tốt nhất',
    keywords: ['sản phẩm', 'loa bluetooth', 'tai nghe không dây'],
    url: '/products',
    status: 'active',
    lastUpdated: '2025-01-14T15:20:00Z',
  },
];

export default function SEOPage() {
  const [pages, setPages] = useState<SEOPage[]>(mockSEOPages);
  const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Implement save logic
    console.log('Saving SEO settings');
    setIsEditing(false);
    setSelectedPage(null);
  };

  const handleEdit = (page: SEOPage) => {
    setSelectedPage(page);
    setIsEditing(true);
  };

  const handleDelete = (pageId: string) => {
    setPages(pages.filter(p => p.id !== pageId));
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
                <h3 className="text-lg font-semibold text-gray-900">Trang SEO</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm trang
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {pages.map((page) => (
                <motion.div
                  key={page.id}
                  className="p-6 hover:bg-gray-50"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{page.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">URL: {page.url}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {page.keywords.map((keyword, index) => (
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
                        onClick={() => handleEdit(page)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                  <span className="text-sm text-gray-600">Tổng trang</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{pages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Đang hoạt động</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {pages.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-gray-600">Cần cập nhật</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt SEO chung
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <TrendingUp className="w-4 h-4 mr-2" />
                Báo cáo SEO
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
      {isEditing && selectedPage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                  <input
                    type="text"
                    defaultValue={selectedPage.title}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    rows={3}
                    defaultValue={selectedPage.description}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Từ khóa</label>
                  <input
                    type="text"
                    defaultValue={selectedPage.keywords.join(', ')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nhập từ khóa, cách nhau bằng dấu phẩy"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
