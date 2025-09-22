import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(request: Request) {
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

    const allFiles: any[] = []
    
    if (imageResults.status === 'fulfilled' && imageResults.value.resources) {
      allFiles.push(...imageResults.value.resources)
    }
    
    if (videoResults.status === 'fulfilled' && videoResults.value.resources) {
      allFiles.push(...videoResults.value.resources)
    }

    // Filter files that belong to this folder or its subfolders
    const folderFiles = allFiles.filter(file => 
      file.public_id.startsWith(folderPath + '/') || 
      file.public_id === folderPath
    )

    console.log(`Found ${folderFiles.length} files to delete in folder: ${folderPath}`)

    // Delete all files in the folder
    const deletedFiles = []
    const failedDeletes = []

    for (const file of folderFiles) {
      try {
        const result = await cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.resource_type || 'image'
        })
        
        if (result.result === 'ok') {
          deletedFiles.push(file.public_id)
        } else {
          failedDeletes.push({ public_id: file.public_id, error: result.result })
        }
      } catch (error: any) {
        failedDeletes.push({ public_id: file.public_id, error: error.message })
      }
    }

    // Try to delete the folder itself (if it exists as a folder in Cloudinary)
    try {
      await cloudinary.api.delete_folder(folderPath)
      console.log(`Deleted folder: ${folderPath}`)
    } catch (error) {
      console.log(`Could not delete folder structure: ${folderPath}`)
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa thư mục '${folderPath.split('/').pop()}' và ${deletedFiles.length} files`,
      deletedFiles,
      failedDeletes,
      totalFiles: folderFiles.length
    })

  } catch (error: any) {
    console.error('Delete folder error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Không thể xóa thư mục'
      },
      { status: 500 }
    )
  }
}
