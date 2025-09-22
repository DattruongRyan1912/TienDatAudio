'use client'

import { useState } from 'react'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import CloudinaryVideoPlayer from '@/components/CloudinaryVideoPlayer'
import { useNotification } from '@/hooks/useNotification'

interface UploadedFile {
  public_id: string
  secure_url: string
  resource_type: string
  format: string
  width?: number
  height?: number
  duration?: number
}

export default function CloudinaryTestPage() {
  const { showError } = useNotification()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleUploadComplete = (result: any) => {
    console.log('Upload complete:', result)
    setUploadedFiles(prev => [...prev, result])
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    showError('Upload failed', error)
  }

  const clearUploads = () => {
    setUploadedFiles([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🎬 Cloudinary Integration Test
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📤 Upload Files</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Upload */}
            <div>
              <h3 className="font-medium mb-3">🎥 Video Upload</h3>
              <CloudinaryUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                type="video"
                folder="test"
                accept="video"
                maxSize={100} // 100MB
                className=""
              />
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="font-medium mb-3">🖼️ Image Upload</h3>
              <CloudinaryUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                type="combo-image"
                folder="test"
                accept="image"
                maxSize={10} // 10MB
                className=""
              />
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <button
                onClick={clearUploads}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              📋 Uploaded Files ({uploadedFiles.length})
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {file.resource_type === 'video' ? '🎥' : '🖼️'}
                      </span>
                      <span className="font-medium text-sm">
                        {file.format?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>ID: {file.public_id}</div>
                      {file.width && file.height && (
                        <div>Size: {file.width}×{file.height}</div>
                      )}
                      {file.duration && (
                        <div>Duration: {Math.round(file.duration)}s</div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {file.resource_type === 'video' ? (
                      <CloudinaryVideoPlayer
                        publicId={file.public_id}
                        width={400}
                        height={300}
                        controls={true}
                        muted={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={file.secure_url}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* URL */}
                  <div className="mt-3">
                    <input
                      type="text"
                      value={file.secure_url}
                      readOnly
                      className="w-full px-2 py-1 text-xs border rounded text-gray-600 bg-gray-50"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold mb-3 text-blue-800">
            ℹ️ Thông tin test
          </h2>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Upload video/image lên Cloudinary CDN</p>
            <p>• Tự động tối ưu quality và format</p>
            <p>• Video được tạo responsive sources</p>
            <p>• Click vào URL để copy và test</p>
            <p>• Files sẽ lưu trong folder `tiendataudio/test/`</p>
          </div>
        </div>
      </div>
    </div>
  )
}
