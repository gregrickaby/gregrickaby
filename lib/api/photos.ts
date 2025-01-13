'use server'

import {WP_Query} from '@/lib/api/WP_Query'

/**
 * Fetches the list of photos from the WordPress API.
 */
async function getPhotosList() {
  try {
    // Fetch photos list.
    const response = new WP_Query({
      post_type: 'pages',
      per_page: 100,
      slug: 'photos',
      _fields: ['acf']
    })

    // Parse response.
    const data = await response.getPosts()

    // If there is an error, throw it.
    if (!data.length) {
      throw new Error('Failed to fetch photos list')
    }

    // Extract photos.
    const photos = data.map((page) => page.acf.portfolio || [])

    // Flatten array.
    return photos.flat()
  } catch (error) {
    console.error('Error fetching photos list', error)
    return []
  }
}

/**
 * Fetches photos from the WordPress API.
 */
export async function fetchPhotos() {
  try {
    // Get list of photos.
    const photosList = await getPhotosList()

    // Build URL.
    const url = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media`)

    // Add query params.
    url.searchParams.set('per_page', '100')
    url.searchParams.set('include', photosList.join(','))
    url.searchParams.set(
      '_fields',
      [
        'alt_text',
        'caption',
        'description',
        'media_details',
        'title',
        'id'
      ].join(',')
    )

    // Fetch photos.
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: 86400, // 24 hours.
        tags: ['photos']
      }
    })

    // If there is an error, throw it.
    if (!response.ok) {
      throw new Error('Failed to fetch photos')
    }

    // Parse response.
    const photos = await response.json()

    // Sort the photos to match the order of `photosList`.
    const sortedPhotos = photosList.map((id) =>
      photos.find((photo: {id: number}) => photo.id === id)
    )

    return sortedPhotos
  } catch (error) {
    console.error('Error fetching photos:', error)
    throw error
  }
}
