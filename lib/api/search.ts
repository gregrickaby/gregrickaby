import type {SearchResults} from '@/lib/types'

/**
 * Search the WordPress REST API for posts matching the query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/search-results/
 */
export async function searchQuery(query: string): Promise<SearchResults[]> {
  // Sanitize the search query.
  const sanitizedQuery = encodeURIComponent(query.trim())

  try {
    // Perform the fetch request with a timeout.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // Fetch the search results.
    const response = await fetch(
      `https://blog.gregrickaby.com/wp-json/wp/v2/search?search=${sanitizedQuery}&subtype=any&per_page=100`,
      {
        cache: 'no-cache',
        signal: controller.signal
      }
    )

    // Clear the timeout.
    clearTimeout(timeoutId)

    // Check if the response is OK (status 200).
    if (!response.ok) {
      console.error('Response Status:', response.status)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          'Client error occurred. Please check your query and try again.'
        )
      } else if (response.status >= 500) {
        throw new Error('Server error occurred. Please try again later.')
      } else {
        throw new Error('Unexpected error occurred.')
      }
    }

    // Parse the response as JSON.
    const data = await response.json()

    // Validate the response data.
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No posts found.')
    }

    // Return the data as SearchResults.
    return data as SearchResults[]
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to fetch search results. Please try again later.')
  }
}
