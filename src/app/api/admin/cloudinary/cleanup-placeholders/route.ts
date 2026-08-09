import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()

  try {
    const { folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { success: false, message: 'Missing folderPath' },
        { status: 400 }
      )
    }

    // Find all placeholder files in the folder
    const placeholderPatterns = [
      `${folderPath}/.folder-placeholder`,
      `${folderPath}/folder-info`,
      `${folderPath}/.folder-temp`,
      `${folderPath}/README`
    ]

    const deletedFiles = []
    
    for (const pattern of placeholderPatterns) {
      try {
        // Try to delete each placeholder type
        const result = await cloudinary.uploader.destroy(pattern, {
          resource_type: 'auto'
        })
        
        if (result.result === 'ok') {
          deletedFiles.push(pattern)
        }
      } catch {}
    }

    // Also try to delete image placeholders
    for (const pattern of placeholderPatterns) {
      try {
        const result = await cloudinary.uploader.destroy(pattern, {
          resource_type: 'image'
        })
        
        if (result.result === 'ok') {
          deletedFiles.push(pattern)
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${deletedFiles.length} placeholder files`,
      deletedFiles
    })

  } catch (error: unknown) {
    console.error('Delete placeholder files error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Không thể xóa placeholder files'
      },
      { status: 500 }
    )
  }
}
