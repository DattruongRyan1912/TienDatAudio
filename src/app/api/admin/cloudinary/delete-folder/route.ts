import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

interface CloudinaryResource {
  public_id: string
  resource_type?: string
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('folderPath')

    if (!folderPath) {
      return NextResponse.json(
        { success: false, message: 'Missing folderPath' },
        { status: 400 }
      )
    }

    // Get all files in the folder and subfolders
    const [imageResults, videoResults] = await Promise.allSettled([
      cloudinary.search
        .expression(`folder:${folderPath}/* OR folder:${folderPath}`)
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute(),
      cloudinary.search
        .expression(`resource_type:video AND (folder:${folderPath}/* OR folder:${folderPath})`)
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute()
    ])

    const allFiles: CloudinaryResource[] = []
    
    if (imageResults.status === 'fulfilled' && imageResults.value.resources) {
      allFiles.push(...imageResults.value.resources as CloudinaryResource[])
    }
    
    if (videoResults.status === 'fulfilled' && videoResults.value.resources) {
      allFiles.push(...videoResults.value.resources as CloudinaryResource[])
    }

    // Filter files that belong to this folder or its subfolders
    const folderFiles = allFiles.filter(file => 
      file.public_id.startsWith(folderPath + '/') || 
      file.public_id === folderPath
    )

    // Delete all files in the folder
    const deletedFiles = []
    const failedDeletes = []

    for (const file of folderFiles) {
      try {
        const result = await cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.resource_type === 'video' ? 'video' : 'image'
        })
        
        if (result.result === 'ok') {
          deletedFiles.push(file.public_id)
        } else {
          failedDeletes.push({ public_id: file.public_id, error: result.result })
        }
      } catch (error: unknown) {
        failedDeletes.push({
          public_id: file.public_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Try to delete the folder itself (if it exists as a folder in Cloudinary)
    try {
      await cloudinary.api.delete_folder(folderPath)
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Đã xóa thư mục '${folderPath.split('/').pop()}' và ${deletedFiles.length} files`,
      deletedFiles,
      failedDeletes,
      totalFiles: folderFiles.length
    })

  } catch (error: unknown) {
    console.error('Delete folder error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Không thể xóa thư mục'
      },
      { status: 500 }
    )
  }
}
