import type {SearchResults} from '@/lib/types'

/**
 * Search the WordPress REST API for posts matching the query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/search-results/
 */
export async function searchQuery(query: string): Promise<SearchResults[]> {
  try {
    // If no query is provided, throw an error.
    if (!query) {
      throw new Error('Please enter a search query.')
    }

    // Sanitize the search query.
    const sanitizedQuery = encodeURIComponent(query.trim())

    // Perform the fetch request with a timeout.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // Create a new URL.
    const url = new URL(`${process.env.WORDPRESS_API_URL}/search`)

    // Add the query parameters.
    url.searchParams.append('search', sanitizedQuery)
    url.searchParams.append('subtype', 'any')
    url.searchParams.append('per_page', '100')

    // Fetch the search results.
    const response = await fetch(url.toString(), {
      cache: 'no-cache',
      signal: controller.signal
    })

    // Clear the timeout.
    clearTimeout(timeoutId)

    // Check if the response is OK.
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

    // Parse the response.
    const data: SearchResults[] = await response.json()

    // Validate the response data.
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No posts found.')
    }

    // Return the data as SearchResults.
    return data
  } catch (error) {
    console.error('Exception thrown in searchQuery():', error)
    throw error
  }
}
