import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export async function uploadImage(
  file: string,
  folder: string = 'zim-mall'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    moderation: 'aws_rek',
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export async function uploadProductImage(file: string): Promise<UploadResult> {
  return uploadImage(file, 'zim-mall/products')
}

export async function uploadStoreLogo(file: string): Promise<UploadResult> {
  return uploadImage(file, 'zim-mall/stores/logos')
}

export async function uploadStoreBanner(file: string): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: 'zim-mall/stores/banners',
    transformation: [
      { width: 1920, height: 480, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(
  url: string,
  width: number,
  height: number
): string {
  if (!url.includes('cloudinary.com')) return url

  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${parts[1]}`
}

export default cloudinary
