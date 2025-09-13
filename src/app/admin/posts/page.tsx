'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Edit, 
  Trash2,
  FileText,
  Eye,
  Calendar,
  User
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  status: 'draft' | 'published'
  author: string
  published_at: string
  created_at: string
  updated_at: string
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Hướng dẫn chọn mua loa bluetooth chất lượng',
    slug: 'huong-dan-chon-mua-loa-bluetooth-chat-luong',
    excerpt: 'Những điều cần biết khi chọn mua loa bluetooth để có trải nghiệm âm thanh tốt nhất...',
    content: '',
    featured_image: '/images/blog/loa-bluetooth.jpg',
    status: 'published',
    author: 'Admin',
    published_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Đánh giá chi tiết tai nghe Sony WH-1000XM5',
    slug: 'danh-gia-chi-tiet-tai-nghe-sony-wh-1000xm5',
    excerpt: 'Cùng khám phá những tính năng nổi bật của tai nghe Sony WH-1000XM5...',
    content: '',
    featured_image: '/images/blog/sony-headphone.jpg',
    status: 'draft',
    author: 'Admin',
    published_at: '',
    created_at: '2025-01-14T15:30:00Z',
    updated_at: '2025-01-14T16:00:00Z'
  }
]

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa xuất bản'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
        <PageHeader
          title="Quản lý bài viết"
          description="Quản lý các bài viết, tin tức và hướng dẫn về sản phẩm"
          action={{
            label: "Thêm bài viết",
            onClick: () => console.log('Add post')
          }}
          breadcrumb={[
            { label: 'Admin', href: '/admin' },
            { label: 'Bài viết' }
          ]}
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách bài viết ({filteredPosts.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="Đang tải bài viết..." />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Featured Image */}
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {post.author}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(post.published_at)}
                              </div>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>

                            <div className="flex items-center space-x-1">
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-1 rounded">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="Chưa có bài viết nào"
                description="Chưa có bài viết nào được tạo. Hãy tạo bài viết đầu tiên để chia sẻ thông tin về sản phẩm."
                action={{
                  label: "Tạo bài viết đầu tiên",
                  onClick: () => console.log('Create first post')
                }}
              />
            )}
          </div>
        </div>
      </div>
  )
}