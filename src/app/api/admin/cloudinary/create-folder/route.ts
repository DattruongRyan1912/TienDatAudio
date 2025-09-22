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
    const { folderPath, currentFolder } = await request.json()

    if (!folderPath || !currentFolder) {
      return NextResponse.json(
        { success: false, message: 'Missing folderPath or currentFolder' },
        { status: 400 }
      )
    }

    // Validate folder name
    const folderName = folderPath.split('/').pop()
    if (!folderName || !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
      return NextResponse.json(
        { success: false, message: 'Tên thư mục chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang' },
        { status: 400 }
      )
    }

    // Simple approach: Just return success and let user upload files to create the folder
    // Cloudinary folders are created automatically when files are uploaded to them
    
    return NextResponse.json({
      success: true,
      message: `Thư mục '${folderName}' đã được chuẩn bị. Hãy upload file đầu tiên để tạo thư mục.`,
      folderPath,
      note: 'Folder will be created when you upload the first file'
    })

  } catch (error: any) {
    console.error('Create folder error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Không thể chuẩn bị thư mục'
      },
      { status: 500 }
    )
  }
}
