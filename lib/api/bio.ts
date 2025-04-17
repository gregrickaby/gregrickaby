'use server'

/**
 * Fetch bio content from the WordPress API.
 *
 * @returns The bio content as a string.
 */
export async function getBio(): Promise<string> {
  // Build URL.
  const url = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/bio`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: 86400, // 24 hours.
        tags: ['bio']
      }
    })

    // If there is an error, throw it.
    if (!response.ok) {
      throw new Error('Failed to fetch bio')
    }

    // Parse response.
    const data = await response.json()

    // If the response is not an array, throw an error.
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format for bio')
    }

    return data[0].content.rendered as string
  } catch (error) {
    console.error(`Exception thrown in getBio(): ${error}`)
    throw error
  }
}
