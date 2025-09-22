import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'tiendataudio'
    const maxResults = parseInt(searchParams.get('max_results') || '50')

    // Get both images and videos separately since 'auto' doesn't work
    const [imageResults, videoResults] = await Promise.allSettled([
      cloudinary.search
        .expression(`resource_type:image`)
        .sort_by('created_at', 'desc')
        .max_results(maxResults)
        .execute(),
      cloudinary.search
        .expression(`resource_type:video`)
        .sort_by('created_at', 'desc')
        .max_results(maxResults)
        .execute()
    ])

    // Combine results
    const allFiles: any[] = []
    
    if (imageResults.status === 'fulfilled' && imageResults.value.resources) {
      allFiles.push(...imageResults.value.resources)
    }
    
    if (videoResults.status === 'fulfilled' && videoResults.value.resources) {
      allFiles.push(...videoResults.value.resources)
    }

    // Filter by folder - exact folder match or subfolder
    const filteredFiles = allFiles.filter(file => {
      if (!file.public_id) return false
      
      // If requesting root folder, show all files that start with it
      if (folder === 'tiendataudio') {
        // Show files that are:
        // 1. Direct files in tiendataudio/ (tiendataudio/filename.ext)
        // 2. Files uploaded to root without folder (filename.ext)
        const isDirectInTiendataudio = file.public_id.startsWith('tiendataudio/') && 
                                      !file.public_id.substring('tiendataudio/'.length).includes('/')
        const isRootFile = !file.public_id.includes('/') // Files uploaded directly to Cloudinary root
        
        return isDirectInTiendataudio || isRootFile
      }
      
      // For specific folders, check if file is directly in that folder
      const filePath = file.public_id
      const folderPath = folder.endsWith('/') ? folder : folder + '/'
      
      // File should start with folder path and not have additional subfolders
      if (filePath.startsWith(folderPath)) {
        const relativePath = filePath.substring(folderPath.length)
        const isDirectChild = !relativePath.includes('/')
        return isDirectChild
      }
      
      return false
    })

    // Sort combined results by created_at
    filteredFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Get folders using the admin API
    let folders: any[] = []
    try {
      // Create folder structure from files
      const folderSet = new Set<string>()
      
      allFiles.forEach(file => {
        if (!file.public_id) return
        
        const parts = file.public_id.split('/')
        if (parts.length > 1) {
          // Build folder path progressively
          let currentPath = ''
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (i > 0 ? '/' : '') + parts[i]
            
            // Only add subfolders of current folder
            if (folder === 'tiendataudio') {
              // At root level, show immediate subfolders of tiendataudio
              if (i === 1 && parts[0] === 'tiendataudio') {
                folderSet.add(currentPath)
              }
            } else {
              // In subfolder, show immediate children
              const folderPath = folder.endsWith('/') ? folder : folder + '/'
              if (currentPath.startsWith(folderPath) && currentPath !== folder) {
                const relativePath = currentPath.substring(folderPath.length)
                // Only add immediate child folders (not nested ones)
                if (!relativePath.includes('/')) {
                  folderSet.add(currentPath)
                }
              }
            }
          }
        }
      })
      
      folders = Array.from(folderSet).map(folderPath => {
        const parts = folderPath.split('/')
        const name = parts[parts.length - 1]
        
        // Count files in this folder and all subfolders
        const fileCount = allFiles.filter(file => {
          return file.public_id.startsWith(folderPath + '/')
        }).length
        
        return {
          name,
          path: folderPath,
          count: fileCount
        }
      })
      
    } catch (folderError) {
      console.warn('Could not process folders:', folderError)
      // Continue without folders if this fails
    }

    // Process files
    const files = filteredFiles.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      url: resource.url,
      format: resource.format,
      resource_type: resource.resource_type,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.folder,
      duration: resource.duration,
      tags: resource.tags || []
    }))

    // Process folders
    const processedFolders = folders.map((folder: any) => ({
      name: folder.name,
      path: folder.path,
      count: folder.count
    }))

    return NextResponse.json({
      success: true,
      files,
      folders: processedFolders,
      total: filteredFiles.length
    })

  } catch (error) {
    console.error('Cloudinary API error:', error)
    
    // Return a more detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch files',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}
