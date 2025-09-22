import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cloudinary connection...')
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
    
    // Simple test - get account info
    const result = await cloudinary.api.ping()
    console.log('Ping result:', result)

    // Try to get any resources (without folder filter)
    const allResources = await cloudinary.api.resources({
      max_results: 5,
      resource_type: 'image' // Use specific type instead of 'auto'
    })
    
    console.log('Found resources:', allResources.resources?.length || 0)

    // Also try video resources
    let videoResources
    try {
      videoResources = await cloudinary.api.resources({
        max_results: 5,
        resource_type: 'video'
      })
    } catch (videoError) {
      console.log('No videos found or error:', videoError instanceof Error ? videoError.message : 'Unknown error')
      videoResources = { resources: [] }
    }

    return NextResponse.json({
      success: true,
      ping: result,
      totalImages: allResources.total_count || 0,
      totalVideos: videoResources.total_count || 0,
      sampleImages: allResources.resources?.slice(0, 3) || [],
      sampleVideos: videoResources.resources?.slice(0, 3) || []
    })

  } catch (error) {
    console.error('Cloudinary test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
