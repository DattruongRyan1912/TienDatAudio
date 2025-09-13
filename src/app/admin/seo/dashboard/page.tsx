"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Globe,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Eye,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface SEOAnalytics {
  totalPages: number;
  indexedPages: number;
  averageScore: number;
  issues: number;
  recentUpdates: number;
}

interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  page: string;
  priority: 'high' | 'medium' | 'low';
}

const mockAnalytics: SEOAnalytics = {
  totalPages: 25,
  indexedPages: 22,
  averageScore: 85,
  issues: 8,
  recentUpdates: 3,
};

const mockIssues: SEOIssue[] = [
  {
    id: '1',
    type: 'error',
    title: 'Thiếu meta description',
    description: 'Trang không có meta description',
    page: '/products/loa-jbl',
    priority: 'high',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Title quá dài',
    description: 'Tiêu đề trang vượt quá 60 ký tự',
    page: '/products/tai-nghe-sony',
    priority: 'medium',
  },
];

export default function SEODashboard() {
  const [analytics, setAnalytics] = useState<SEOAnalytics>(mockAnalytics);
  const [issues, setIssues] = useState<SEOIssue[]>(mockIssues);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="SEO Dashboard"
          description="Tổng quan về tình trạng SEO website"
          breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "SEO", href: "/admin/seo" }, { label: "Dashboard" }]}
        />
        <button
          onClick={refreshData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng trang SEO</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalPages}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Trang được index</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.indexedPages}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Điểm SEO trung bình</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.averageScore}/100</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vấn đề cần sửa</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.issues}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cập nhật gần đây</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.recentUpdates}</dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SEO Issues */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vấn đề SEO cần chú ý ({issues.length})
          </h3>
          
          <div className="space-y-4">
            {issues.map((issue) => (
              <motion.div
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs text-gray-500">{issue.page}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority === 'high' && 'Cao'}
                          {issue.priority === 'medium' && 'Trung bình'}
                          {issue.priority === 'low' && 'Thấp'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {issues.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có vấn đề SEO</h3>
              <p className="mt-1 text-sm text-gray-500">Website của bạn đang được tối ưu hóa tốt!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
