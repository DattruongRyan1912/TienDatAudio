import { NextRequest, NextResponse } from 'next/server'
import cloudinary, { videoUploadOptions, imageUploadOptions, productImageOptions } from '@/lib/cloudinary'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

// Export configuration for handling large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Set the size limit to 50MB
    },
  },
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!(await requireAdmin())) return unauthorizedResponse()
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string // 'video' | 'image' | 'product'
        const folder = formData.get('folder') as string || 'general'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File exceeds the 50MB limit' }, { status: 413 })
        }
        if (!/^[A-Za-z0-9/_-]+$/.test(folder) || folder.includes('..')) {
            return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Determine upload options based on type
        let uploadOptions
        
        // If folder starts with tiendataudio/, use it as full path
        // Otherwise, build the path based on type
        const isFullPath = folder.startsWith('tiendataudio/')
        
        switch (type) {
            case 'video':
                uploadOptions = {
                    ...videoUploadOptions,
                    folder: isFullPath ? folder : `tiendataudio/combos/videos/${folder}`
                }
                break
            case 'combo-image':
                uploadOptions = {
                    ...imageUploadOptions,
                    folder: isFullPath ? folder : `tiendataudio/combos/images/${folder}`
                }
                break
            case 'product':
                uploadOptions = {
                    ...productImageOptions,
                    folder: isFullPath ? folder : `tiendataudio/products/${folder}`
                }
                break
            default:
                uploadOptions = {
                    resource_type: 'auto' as const,
                    folder: isFullPath ? folder : `tiendataudio/${folder}`,
                    quality: 'auto',
                    format: 'auto'
                }
        }

        return new Promise<NextResponse>((resolve) => {
            // Set a timeout for the upload
            const uploadTimeout = setTimeout(() => {
                console.error('Upload timeout after 120 seconds')
                resolve(NextResponse.json({ 
                    error: 'Upload timeout. File quá lớn hoặc mạng chậm. Vui lòng nén video và thử lại.' 
                }, { status: 408 }))
            }, 120000) // 120 seconds timeout

            cloudinary.uploader.upload_stream(
                {
                    ...uploadOptions,
                    timeout: 120000, // 2 minutes timeout
                },
                (error, result) => {
                    clearTimeout(uploadTimeout)
                    
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        
                        // Handle specific error types
                        if (error.http_code === 499 || error.name === 'TimeoutError') {
                            resolve(NextResponse.json({ 
                                error: 'Upload timeout. File quá lớn (>50MB) hoặc mạng chậm. Vui lòng nén video và thử lại.' 
                            }, { status: 408 }))
                        } else if (error.http_code === 400) {
                            resolve(NextResponse.json({ 
                                error: 'File không hợp lệ. Vui lòng kiểm tra định dạng và kích thước file.' 
                            }, { status: 400 }))
                        } else {
                            resolve(NextResponse.json({ 
                                error: `Upload failed: ${error.message || 'Unknown error'}` 
                            }, { status: 500 }))
                        }
                        return
                    }

                    if (!result) {
                        resolve(NextResponse.json({ error: 'No result from upload' }, { status: 500 }))
                        return
                    }

                    // Return comprehensive upload information
                    const response = {
                        success: true,
                        data: {
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                            url: result.url,
                            format: result.format,
                            resource_type: result.resource_type,
                            width: result.width,
                            height: result.height,
                            bytes: result.bytes,
                            duration: result.duration, // for videos
                            eager: result.eager, // optimized versions
                            folder: result.folder,
                            created_at: result.created_at
                        }
                    }

                    resolve(NextResponse.json(response))
                }
            ).end(buffer)
        })

    } catch (error) {
        console.error('Upload API error:', error)
        return NextResponse.json(
            { error: 'Failed to process upload' },
            { status: 500 }
        )
    }
}

// DELETE endpoint to remove files from Cloudinary
export async function DELETE(request: NextRequest) {
    if (!(await requireAdmin())) return unauthorizedResponse()
    try {
        const { searchParams } = new URL(request.url)
        const publicId = searchParams.get('publicId')
        const requestedResourceType = searchParams.get('resourceType')
        const resourceType = requestedResourceType === 'video' || requestedResourceType === 'raw'
            ? requestedResourceType
            : 'image'

        if (!publicId) {
            return NextResponse.json({ error: 'Public ID required' }, { status: 400 })
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        })

        return NextResponse.json({ 
            success: true, 
            result: result.result 
        })

    } catch (error) {
        console.error('Delete API error:', error)
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        )
    }
}
