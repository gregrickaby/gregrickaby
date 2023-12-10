import { GraphQLResponse, SearchResults } from '@/lib/types'

/**
 * Function to execute a GraphQL query.
 */
export async function fetchGraphQL<T = any>(
  query: string,
  variables: object = {}
): Promise<GraphQLResponse<T>> {
  try {
    // If there is no URL, throw an error.
    if (!process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL) {
      throw new Error('Missing WordPress GraphQL URL environment variable!')
    }

    // Fetch data from external API.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        }),
        next: {
          tags: ['posts']
        }
      }
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const data = await response.json()

    // Throw an error if there was a GraphQL error.
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors)
      throw new Error('Error executing GraphQL query')
    }

    // Finally, return the data.
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Search the WordPress REST API for posts matching the query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/search-results/
 */
export async function searchQuery(query: string): Promise<SearchResults[]> {
  // Sanitize the search query.
  query = encodeURIComponent(query.trim())

  try {
    // If there is no URL, throw an error.
    if (!process.env.NEXT_PUBLIC_WORDPRESS_REST_API_URL) {
      throw new Error('Missing WordPress REST API URL environment variable!')
    }

    // Fetch the search results.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_REST_API_URL}/search?search=${query}&subtype=any&per_page=100`,
      {
        next: {
          tags: ['search']
        }
      }
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const data = await response.json()

    // Verify data has posts.
    if (!data || data.length === 0) {
      throw new Error('No posts found.')
    }

    // Return the data.
    return data as SearchResults[]
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

/**
 * Format a date.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
 */
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Chicago'
  }).format(new Date(date))
}
