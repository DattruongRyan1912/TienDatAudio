import { v2 as cloudinary } from 'cloudinary'

// Server-side configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 120 seconds timeout for large files
  upload_timeout: 120000, // Upload specific timeout
})

// Video upload options
export const videoUploadOptions = {
  resource_type: 'video' as const,
  folder: 'tiendataudio/combos/videos',
  quality: 'auto',
  format: 'mp4',
  chunk_size: 6000000, // 6MB chunks for large files
  timeout: 120000, // 120 seconds timeout
  upload_timeout: 120000, // Upload specific timeout
  eager_async: true, // Process transformations asynchronously to speed up upload
  transformation: [
    {
      width: 1080,
      height: 1920,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:good'
    }
  ],
  eager: [
    {
      width: 1080,
      height: 1920,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:low',
      format: 'mp4'
    },
    {
      width: 720,
      height: 1280,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:low',
      format: 'mp4'
    }
  ]
}

// Image upload options
export const imageUploadOptions = {
  resource_type: 'image' as const,
  folder: 'tiendataudio/combos/images',
  quality: 'auto',
  format: 'webp',
  transformation: [
    {
      width: 1080,
      height: 1350,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:good'
    }
  ],
  eager: [
    {
      width: 1080,
      height: 1350,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:eco',
      format: 'webp'
    },
    {
      width: 540,
      height: 675,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:eco',
      format: 'webp'
    }
  ]
}

// Product image upload options
export const productImageOptions = {
  resource_type: 'image' as const,
  folder: 'tiendataudio/products',
  quality: 'auto',
  format: 'webp',
  transformation: [
    {
      width: 800,
      height: 800,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto:good'
    }
  ]
}

export default cloudinary
