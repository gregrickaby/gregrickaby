'use server'

import {CloudinaryResponse} from '@/lib/types'

/**
 * Fetches all images from a specific folder in Cloudinary.
 */
export default async function getPhotos(): Promise<CloudinaryResponse> {
  // Set the Cloudinary API credentials.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  // If the Cloudinary API credentials are not set, throw an error.
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary API credentials are not set')
  }

  // Build the URL.
  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`
  )

  // Build the query parameters.
  url.searchParams.append('prefix', 'portfolio/')
  url.searchParams.append('max_results', '200')

  // Fetch the photos.
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      next: {
        tags: ['photos'],
        revalidate: 86400 // 24 hours.
      }
    })

    // Bad response? Throw an error.
    if (!response.ok) {
      throw new Error(
        `Failed to fetch photos: ${response.status} ${response.statusText}`
      )
    }

    // Parse the response.
    const data: CloudinaryResponse = await response.json()

    // If the response is not an array, return an error.
    if (!Array.isArray(data.resources)) {
      throw new Error('No resources found')
    }

    // Return the photos.
    return data
  } catch (error) {
    console.error(`Exception thrown in getPhotos(): ${error}`)
    throw error
  }
}
