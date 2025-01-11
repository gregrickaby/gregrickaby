'use server'

import {CloudinaryResponse} from '../types'

/**
 * Fetches all images from a specific folder in Cloudinary.
 */
export default async function getPhotos(): Promise<CloudinaryResponse> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folderName = 'portfolio/'
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${folderName}&max_results=100`

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary API credentials are not set')
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok || response.status !== 200) {
      throw new Error(
        `Failed to fetch photos: ${response.status} ${response.statusText}`
      )
    }

    const data: CloudinaryResponse = await response.json()

    return data || []
  } catch (error) {
    console.error(error)
    throw error
  }
}
