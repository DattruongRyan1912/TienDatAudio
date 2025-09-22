import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
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
      } catch (error) {
        // Continue if file doesn't exist
        console.log(`Placeholder ${pattern} not found or already deleted`)
      }
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
      } catch (error) {
        console.log(`Image placeholder ${pattern} not found`)
      }
    }

    console.log('Deleted placeholder files:', deletedFiles)

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${deletedFiles.length} placeholder files`,
      deletedFiles
    })

  } catch (error: any) {
    console.error('Delete placeholder files error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Không thể xóa placeholder files'
      },
      { status: 500 }
    )
  }
}
