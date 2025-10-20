import {GraphQLClient, type RequestDocument} from 'graphql-request'

/**
 * WordPress GraphQL API URL from environment variables.
 */
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL

if (!WORDPRESS_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_WORDPRESS_API_URL is not defined in environment variables'
  )
}

/**
 * Create a GraphQL client instance for WordPress.
 */
const client = new GraphQLClient(WORDPRESS_API_URL, {
  headers: {
    'Content-Type': 'application/json'
  }
  // Note: Cache options are set per-request in executeQuery()
})

/**
 * Execute a typed GraphQL query against WordPress.
 * Always fetches fresh data (no caching).
 *
 * @param document - The GraphQL document/query string
 * @param variables - Query variables
 * @returns The typed query result
 */
export async function executeQuery<TResult = unknown, TVariables = unknown>(
  document: RequestDocument,
  variables?: TVariables
): Promise<TResult> {
  try {
    // Always use no-store to fetch fresh data on every request
    const queryClient = new GraphQLClient(WORDPRESS_API_URL!, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    return await queryClient.request(document, variables ?? {})
  } catch (error) {
    console.error('GraphQL query error:', error)
    throw error
  }
}

/**
 * Get the WordPress GraphQL client instance.
 * Use this for direct access to the client if needed.
 */
export function getClient(): GraphQLClient {
  return client
}
