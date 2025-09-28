'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder,
  File,
  Image as ImageIcon,
  Video,
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Upload,
  RefreshCw,
  FolderOpen,
  Eye,
  Copy,
  MoreVertical,
  Calendar,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast, toast } from '@/components/ui/toast'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import CloudinaryVideoPlayer from '@/components/CloudinaryVideoPlayer'

interface CloudinaryFile {
  public_id: string
  secure_url: string
  url: string
  format: string
  resource_type: 'image' | 'video' | 'raw'
  width?: number
  height?: number
  bytes: number
  created_at: string
  folder?: string
  duration?: number
  tags?: string[]
}

interface CloudinaryFolder {
  name: string
  path: string
  count: number
}

interface CloudinaryManagerProps {
  className?: string
}

export default function CloudinaryManager({ className = '' }: CloudinaryManagerProps) {
  const { addToast } = useToast()
  const [files, setFiles] = useState<CloudinaryFile[]>([])
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>('tiendataudio')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'raw'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [previewFile, setPreviewFile] = useState<CloudinaryFile | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    images: 0,
    videos: 0
  })

  // Load files from current folder
  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/cloudinary/files?folder=${currentFolder}`)
      
      if (response.ok) {
        const data = await response.json()
        
        setFiles(data.files || [])
        setFolders(data.folders || [])
        
        // Filter out placeholder files for stats calculation
        const realFiles = data.files?.filter((f: CloudinaryFile) => 
          !f.public_id.includes('.folder-placeholder') && 
          !f.public_id.includes('folder-info')
        ) || []
        
        // Calculate stats
        const totalSize = realFiles.reduce((sum: number, file: CloudinaryFile) => sum + file.bytes, 0)
        const images = realFiles.filter((f: CloudinaryFile) => f.resource_type === 'image').length
        const videos = realFiles.filter((f: CloudinaryFile) => f.resource_type === 'video').length
        
        setStats({
          totalFiles: realFiles.length,
          totalSize,
          images,
          videos
        })
      } else {
        console.error('API Error:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
        
        // Show error but don't crash
        addToast(toast.error(
          'Lỗi khi tải files',
          errorData.message || 'Unknown error'
        ))
        
        // Reset to empty state
        setFiles([])
        setFolders([])
        setStats({ totalFiles: 0, totalSize: 0, images: 0, videos: 0 })
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      addToast(toast.error(
        'Không thể kết nối đến Cloudinary',
        'Vui lòng kiểm tra kết nối.'
      ))
      
      // Reset to empty state
      setFiles([])
      setFolders([])
      setStats({ totalFiles: 0, totalSize: 0, images: 0, videos: 0 })
    } finally {
      setIsLoading(false)
    }
  }, [currentFolder])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Create new folder and immediately show upload UI for that folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const folderPath = `${currentFolder}/${newFolderName.trim()}`
      
      // Instead of creating empty folder, just validate and prepare
      const response = await fetch('/api/admin/cloudinary/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderPath,
          currentFolder
        })
      })

      if (response.ok) {
        const result = await response.json()
        setNewFolderName('')
        setShowCreateFolder(false)
        
        // Navigate to the new folder and show upload UI
        setCurrentFolder(folderPath)
        setShowUpload(true)
        
        addToast(toast.success(
          'Tạo thư mục thành công!',
          'Bạn có thể upload file đầu tiên vào thư mục này ngay bây giờ.',
          {
            duration: 7000,
            action: {
              label: 'Upload ngay',
              onClick: () => setShowUpload(true)
            }
          }
        ))
      } else {
        const errorData = await response.json()
        addToast(toast.error(
          'Lỗi tạo thư mục',
          errorData.message || 'Unknown error'
        ))
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
      addToast(toast.error(
        'Không thể tạo thư mục',
        'Vui lòng thử lại.'
      ))
    }
  }

  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    // Hide folder placeholder files
    if (file.public_id.includes('folder-info') || file.public_id.includes('.folder-placeholder')) {
      return false
    }
    
    const matchesSearch = file.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || file.resource_type === filterType
    return matchesSearch && matchesType
  })

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle file selection
  const toggleFileSelection = (publicId: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(publicId)) {
      newSelection.delete(publicId)
    } else {
      newSelection.add(publicId)
    }
    setSelectedFiles(newSelection)
  }

  // Handle folder selection
  const toggleFolderSelection = (folderPath: string) => {
    const newSelection = new Set(selectedFolders)
    if (newSelection.has(folderPath)) {
      newSelection.delete(folderPath)
    } else {
      newSelection.add(folderPath)
    }
    setSelectedFolders(newSelection)
  }

  // Delete selected files
  const deleteSelectedFiles = () => {
    if (selectedFiles.size === 0) return
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa files',
      message: `Bạn có chắc chắn muốn xóa ${selectedFiles.size} file(s)? Hành động này không thể hoàn tác.`,
      onConfirm: performDeleteFiles,
      type: 'danger'
    })
  }

  const performDeleteFiles = async () => {

    try {
      for (const publicId of selectedFiles) {
        const file = files.find(f => f.public_id === publicId)
        await fetch(`/api/upload/cloudinary?publicId=${publicId}&resourceType=${file?.resource_type}`, {
          method: 'DELETE'
        })
      }
      
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      console.error('Failed to delete files:', error)
      addToast(toast.error(
        'Có lỗi khi xóa files',
        'Vui lòng thử lại.'
      ))
    }
  }

  // Delete selected folders
  const deleteSelectedFolders = () => {
    if (selectedFolders.size === 0) return
    
    const folderNames = Array.from(selectedFolders).map(path => path.split('/').pop()).join(', ')
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa thư mục',
      message: `Bạn có chắc chắn muốn xóa thư mục: ${folderNames}?\n\nCảnh báo: Tất cả files trong thư mục sẽ bị xóa vĩnh viễn!`,
      onConfirm: performDeleteFolders,
      type: 'danger'
    })
  }

  const performDeleteFolders = async () => {

    try {
      for (const folderPath of selectedFolders) {
        const response = await fetch(`/api/admin/cloudinary/delete-folder?folderPath=${encodeURIComponent(folderPath)}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message)
        }
      }
      
      setSelectedFolders(new Set())
      loadFiles()
      addToast(toast.success(
        'Đã xóa thư mục thành công!',
        `${selectedFolders.size} thư mục đã được xóa.`
      ))
    } catch (error: any) {
      console.error('Failed to delete folders:', error)
      addToast(toast.error(
        'Có lỗi khi xóa thư mục',
        error.message
      ))
    }
  }

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    addToast(toast.success(
      'URL đã được copy!',
      'Link đã được sao chép vào clipboard.'
    ))
  }

  // Handle upload complete
  const handleUploadComplete = async (result: any) => {
    // Cleanup placeholder files in the current folder
    try {
      await fetch('/api/admin/cloudinary/cleanup-placeholders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderPath: currentFolder
        })
      })
    } catch (error) {
      console.log('Could not cleanup placeholder files:', error)
    }
    
    loadFiles() // Refresh file list
    setShowUpload(false)
  }

  // Cleanup placeholder files manually
  const cleanupPlaceholders = async () => {
    try {
      const response = await fetch('/api/admin/cloudinary/cleanup-placeholders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderPath: currentFolder
        })
      })
      
      const result = await response.json()
      if (result.success) {
        addToast(toast.success(
          'Dọn dẹp thành công!',
          result.message
        ))
        loadFiles() // Refresh to update stats
      } else {
        addToast(toast.error(
          'Lỗi dọn dẹp',
          result.message
        ))
      }
    } catch (error) {
      console.error('Failed to cleanup placeholders:', error)
      addToast(toast.error(
        'Không thể dọn dẹp placeholder files',
        'Vui lòng thử lại.'
      ))
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📁 Cloudinary Manager</h1>
            <p className="text-gray-600">Quản lý files và folders trên Cloudinary CDN</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            
            <Button
              onClick={() => setShowCreateFolder(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Folder className="w-4 h-4 mr-2" />
              Tạo thư mục
            </Button>
            
            <Button
              onClick={cleanupPlaceholders}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Dọn dẹp
            </Button>
            
            <Button
              onClick={loadFiles}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">Total Files</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{stats.totalFiles}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Images</span>
            </div>
            <div className="text-xl font-bold text-green-900">{stats.images}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600">Videos</span>
            </div>
            <div className="text-xl font-bold text-purple-900">{stats.videos}</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-600">Total Size</span>
            </div>
            <div className="text-xl font-bold text-orange-900">{formatSize(stats.totalSize)}</div>
          </div>
        </div>

        {/* Actions Bar */}
        {(selectedFiles.size > 0 || selectedFolders.size > 0) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedFiles.size > 0 && (
                  <span className="text-sm text-gray-600">
                    Đã chọn {selectedFiles.size} file(s)
                  </span>
                )}
                {selectedFolders.size > 0 && (
                  <span className="text-sm text-gray-600">
                    Đã chọn {selectedFolders.size} thư mục
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {selectedFiles.size > 0 && (
                  <Button
                    onClick={deleteSelectedFiles}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa Files ({selectedFiles.size})
                  </Button>
                )}
                
                {selectedFolders.size > 0 && (
                  <Button
                    onClick={deleteSelectedFolders}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa Thư mục ({selectedFolders.size})
                  </Button>
                )}
                
                <Button
                  onClick={() => {
                    setSelectedFiles(new Set())
                    setSelectedFolders(new Set())
                  }}
                  variant="outline"
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Panel */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <CloudinaryUpload
                  onUploadComplete={handleUploadComplete}
                  accept="image"
                  type="combo-image"
                  folder={currentFolder}
                  className=""
                />
                <CloudinaryUpload
                  onUploadComplete={handleUploadComplete}
                  accept="video"
                  type="video"
                  folder={currentFolder}
                  className=""
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Folder Modal */}
        <AnimatePresence>
          {showCreateFolder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowCreateFolder(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-green-600" />
                  Tạo thư mục mới
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên thư mục
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nhập tên thư mục..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Thư mục sẽ được tạo trong: {currentFolder}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    💡 Thư mục sẽ được tạo tự động khi bạn upload file đầu tiên vào đó
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateFolder(false)
                      setNewFolderName('')
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={createFolder}
                    disabled={!newFolderName.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Chuẩn bị thư mục & Upload
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="image">Hình ảnh</option>
              <option value="video">Video</option>
              <option value="raw">Khác</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.size > 0 && (
              <Button
                onClick={deleteSelectedFiles}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa ({selectedFiles.size})
              </Button>
            )}

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <FolderOpen className="w-4 h-4" />
          {currentFolder.split('/').map((folder, index, array) => (
            <span key={index} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentFolder(array.slice(0, index + 1).join('/'))}
                className="hover:text-blue-600"
              >
                {folder}
              </button>
              {index < array.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Thư mục
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <div
                  key={folder.path}
                  className="relative group border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 right-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFolders.has(folder.path)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleFolderSelection(folder.path)
                      }}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                  </div>
                  
                  {/* Folder Button */}
                  <button
                    onClick={() => setCurrentFolder(folder.path)}
                    className="w-full flex items-center gap-2 p-3 text-left"
                  >
                    <Folder className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{folder.name}</div>
                      <div className="text-xs text-gray-500">{folder.count} files</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
            <span className="text-gray-600">Đang tải...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không có files nào</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.public_id}
                className={`relative border rounded-lg p-3 hover:shadow-md transition-shadow ${
                  selectedFiles.has(file.public_id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.public_id)}
                    onChange={() => toggleFileSelection(file.public_id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {file.resource_type === 'image' ? (
                    <img
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,f_webp/${file.public_id}`}
                      alt={file.public_id}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewFile(file)}
                    />
                  ) : file.resource_type === 'video' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer"
                         onClick={() => setPreviewFile(file)}>
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <File className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="text-xs font-medium truncate">{file.public_id.split('/').pop()}</div>
                  <div className="text-xs text-gray-500">{formatSize(file.bytes)}</div>
                  <div className="text-xs text-gray-500">{file.format?.toUpperCase()}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.public_id)}
                    onChange={() => toggleFileSelection(file.public_id)}
                    className="rounded"
                  />
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewFile(file)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyUrl(file.secure_url)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.public_id}
                className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 ${
                  selectedFiles.has(file.public_id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.public_id)}
                  onChange={() => toggleFileSelection(file.public_id)}
                  className="rounded"
                />

                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {file.resource_type === 'image' ? (
                    <img
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_48,h_48,c_fill,f_webp/${file.public_id}`}
                      alt={file.public_id}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : file.resource_type === 'video' ? (
                    <Video className="w-6 h-6 text-gray-400" />
                  ) : (
                    <File className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.public_id.split('/').pop()}</div>
                  <div className="text-sm text-gray-500">
                    {formatSize(file.bytes)} • {file.format?.toUpperCase()}
                    {file.width && file.height && ` • ${file.width}×${file.height}`}
                    {file.duration && ` • ${Math.round(file.duration)}s`}
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(file.created_at)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyUrl(file.secure_url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(file.secure_url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{previewFile.public_id.split('/').pop()}</h3>
                  <p className="text-sm text-gray-500">
                    {formatSize(previewFile.bytes)} • {previewFile.format?.toUpperCase()}
                    {previewFile.width && previewFile.height && ` • ${previewFile.width}×${previewFile.height}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewFile(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="p-4 max-h-[70vh] overflow-auto">
                {previewFile.resource_type === 'image' ? (
                  <img
                    src={previewFile.secure_url}
                    alt={previewFile.public_id}
                    className="max-w-full h-auto"
                  />
                ) : previewFile.resource_type === 'video' ? (
                  <CloudinaryVideoPlayer
                    publicId={previewFile.public_id}
                    controls={true}
                    className="max-w-full"
                  />
                ) : (
                  <div className="text-center py-12">
                    <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Không thể preview file này</p>
                    <Button
                      onClick={() => window.open(previewFile.secure_url, '_blank')}
                      className="mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}
