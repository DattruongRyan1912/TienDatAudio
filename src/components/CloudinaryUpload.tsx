'use client'

import { useState, useCallback } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Upload, 
    X, 
    Play, 
    Image as ImageIcon, 
    File, 
    Check, 
    AlertCircle,
    Loader2,
    Cloud
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CloudinaryUploadProps {
    onUploadComplete: (result: CloudinaryUploadResult) => void
    onUploadError?: (error: string) => void
    accept?: 'image' | 'video' | 'both'
    type?: 'video' | 'combo-image' | 'product'
    folder?: string
    maxSize?: number // in MB
    className?: string
}

interface CloudinaryUploadResult {
    public_id: string
    secure_url: string
    url: string
    format: string
    resource_type: string
    width: number
    height: number
    bytes: number
    duration?: number
    eager?: Array<{
        secure_url: string
        url: string
        transformation: string
    }>
}

interface UploadProgress {
    file: File
    progress: number
    status: 'uploading' | 'completed' | 'error'
    result?: CloudinaryUploadResult
    error?: string
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export default function CloudinaryUpload({
    onUploadComplete,
    onUploadError,
    accept = 'both',
    type = 'combo-image',
    folder = 'general',
    maxSize = 100, // 100MB default
    className = ''
}: CloudinaryUploadProps) {
    const [uploads, setUploads] = useState<UploadProgress[]>([])
    const [isDragActive, setIsDragActive] = useState(false)

    const acceptedTypes = {
        image: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        },
        video: {
            'video/*': ['.mp4', '.mov', '.avi', '.webm']
        },
        both: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.mov', '.avi', '.webm']
        }
    }

    const uploadFile = useCallback(async (file: File): Promise<CloudinaryUploadResult> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('folder', folder)

        // Create an AbortController for timeout handling
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, 180000) // 3 minutes timeout

        try {
            const response = await fetch('/api/upload/cloudinary', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const result = await response.json()
            if (!result.success) {
                throw new Error(result.error || 'Upload failed')
            }

            return result.data
        } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Upload timeout sau 3 phút. File quá lớn, vui lòng nén video và thử lại.')
            }
            throw error
        }
    }, [folder, type])

    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach((error) => {
                    if (error.code === 'file-too-large') {
                        onUploadError?.(`File "${file.name}" quá lớn. Kích thước tối đa là ${maxSize}MB.`)
                    } else if (error.code === 'file-invalid-type') {
                        onUploadError?.(`File "${file.name}" không đúng định dạng.`)
                    } else {
                        onUploadError?.(`Lỗi với file "${file.name}": ${error.message}`)
                    }
                })
            })
            return
        }

        // Validate file sizes manually for better error messages
        const validFiles: File[] = []
        for (const file of acceptedFiles) {
            if (file.size > maxSize * 1024 * 1024) {
                onUploadError?.(`File "${file.name}" (${formatFileSize(file.size)}) vượt quá giới hạn ${maxSize}MB. Vui lòng nén file.`)
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length === 0) return

        const newUploads: UploadProgress[] = validFiles.map(file => ({
            file,
            progress: 0,
            status: 'uploading' as const
        }))

        setUploads(prev => [...prev, ...newUploads])

        // Process each file
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i]
            const uploadIndex = uploads.length + i

            try {
                // Simulate progress for large files (slower progress for video files)
                const progressIncrement = type === 'video' ? 5 : 10 // Slower progress for videos
                const progressInterval = setInterval(() => {
                    setUploads(prev => {
                        const updated = [...prev]
                        if (updated[uploadIndex] && updated[uploadIndex].status === 'uploading') {
                            const currentProgress = updated[uploadIndex].progress
                            // Slow down progress as it gets higher for video files
                            const increment = type === 'video' && currentProgress > 50 ? 2 : progressIncrement
                            updated[uploadIndex].progress = Math.min(currentProgress + increment, 90)
                        }
                        return updated
                    })
                }, type === 'video' ? 500 : 200) // Slower updates for videos

                const result = await uploadFile(file)

                clearInterval(progressInterval)

                setUploads(prev => {
                    const updated = [...prev]
                    updated[uploadIndex] = {
                        ...updated[uploadIndex],
                        progress: 100,
                        status: 'completed',
                        result
                    }
                    return updated
                })

                onUploadComplete(result)

            } catch (error) {
                setUploads(prev => {
                    const updated = [...prev]
                    updated[uploadIndex] = {
                        ...updated[uploadIndex],
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Upload failed'
                    }
                    return updated
                })

                onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
            }
        }
    }, [maxSize, onUploadComplete, onUploadError, type, uploadFile, uploads.length])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: acceptedTypes[accept],
        maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false)
    })

    const removeUpload = (index: number) => {
        setUploads(prev => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('video/')) {
            return <Play className="h-8 w-8 text-purple-500" />
        } else if (file.type.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />
        }
        return <File className="h-8 w-8 text-gray-500" />
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                `}
            >
                <input {...getInputProps()} />
                
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: isDragActive ? 1.05 : 1 }}
                    className="space-y-4"
                >
                    <div className="flex justify-center">
                        <Cloud className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    
                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {isDragActive ? 'Thả file vào đây...' : 'Upload lên Cloudinary'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Kéo thả hoặc click để chọn {accept === 'video' ? 'video' : accept === 'image' ? 'hình ảnh' : 'file'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Tối đa {maxSize}MB • Auto-optimize • CDN delivery
                        </p>
                    </div>

                    <Button type="button" variant="outline" className="mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Chọn file
                    </Button>
                </motion.div>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
                {uploads.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        {uploads.map((upload, index) => (
                            <motion.div
                                key={`${upload.file.name}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {/* File Icon */}
                                    <div className="flex-shrink-0">
                                        {getFileIcon(upload.file)}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {upload.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(upload.file.size)}
                                        </p>

                                        {/* Progress Bar */}
                                        {upload.status === 'uploading' && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <motion.div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${upload.progress}%` }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-10">
                                                        {upload.progress}%
                                                    </span>
                                                </div>
                                                {/* Special message for large video files */}
                                                {type === 'video' && upload.file.size > 10 * 1024 * 1024 && (
                                                    <div className="mt-1 text-xs text-amber-600">
                                                        📹 Video lớn (&gt;10MB) - có thể mất 2-3 phút để upload
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Success Info */}
                                        {upload.status === 'completed' && upload.result && (
                                            <div className="mt-2 text-xs text-green-600">
                                                ✓ Uploaded to Cloudinary • {upload.result.width}x{upload.result.height}
                                                {upload.result.duration && ` • ${Math.round(upload.result.duration)}s`}
                                            </div>
                                        )}

                                        {/* Error Info */}
                                        {upload.status === 'error' && (
                                            <div className="mt-2 text-xs text-red-600">
                                                ✗ {upload.error}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                        {upload.status === 'uploading' && (
                                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                        )}
                                        {upload.status === 'completed' && (
                                            <Check className="h-5 w-5 text-green-500" />
                                        )}
                                        {upload.status === 'error' && (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeUpload(index)}
                                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
