import cloudinary, { hasCloudinaryConfig } from '@/lib/cloudinary'
import { fetchPublicImage } from './public-link-preview'
import type { SocialLinkImportedAsset } from '../domain/link-preview'

type CloudinaryImageResult = {
  public_id: string
  secure_url: string
  width?: number
  height?: number
  bytes?: number
  format?: string
}

function uploadImage(buffer: Buffer): Promise<CloudinaryImageResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      resource_type: 'image',
      folder: 'tiendataudio/social/imported',
      quality: 'auto',
      timeout: 120_000,
    }, (error, result) => {
      if (error) return reject(new Error('CLOUDINARY_UPLOAD_FAILED'))
      if (!result) return reject(new Error('CLOUDINARY_UPLOAD_FAILED'))
      resolve(result as CloudinaryImageResult)
    }).end(buffer)
  })
}

export async function importSocialLinkImage(imageUrl: string): Promise<SocialLinkImportedAsset> {
  if (!hasCloudinaryConfig()) throw new Error('CLOUDINARY_REQUIRED')
  const image = await fetchPublicImage(imageUrl)
  const result = await uploadImage(image.buffer)
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: Number.isFinite(result.width) && result.width ? result.width : null,
    height: Number.isFinite(result.height) && result.height ? result.height : null,
    bytes: Number.isFinite(result.bytes) && result.bytes ? result.bytes : image.buffer.byteLength,
    format: result.format || image.contentType.replace('image/', ''),
  }
}
