import config from '@/lib/config'
import {GitHubRepo, GraphQLResponse, Page, SearchResults} from '@/lib/types'
import {Metadata} from 'next'

/**
 * Function to execute a GraphQL query.
 */
export async function fetchGraphQL<T = any>(
  query: string,
  variables?: {[key: string]: any},
  preview = false
): Promise<GraphQLResponse<T>> {
  try {
    // Validate the WordPress GraphQL URL.
    const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL
    if (!graphqlUrl) {
      throw new Error('Missing WordPress GraphQL URL environment variable!')
    }

    // Get the refresh token.
    const refreshToken = process.env.NEXTJS_AUTH_REFRESH_TOKEN

    // Prepare headers.
    const headers: {[key: string]: string} = {
      'Content-Type': 'application/json'
    }

    // If preview mode is enabled and we have a token.
    if (preview && refreshToken) {
      // Add refresh token to fetch headers.
      headers['Authorization'] = `Bearer ${refreshToken}`
    }

    // Get the slug.
    const slug = variables?.slug || variables?.id || 'graphql'

    // Fetch data from external API.
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables
      }),
      next: {
        tags: [slug]
      }
    })

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

    // Always fetch fresh search results.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_REST_API_URL}/search?search=${query}&subtype=any&per_page=100`
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
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

/**
 * Get most starred GitHub repos.
 *
 * @see https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
 */
export async function getPopularGithubRepos(
  limit: number
): Promise<GitHubRepo[]> {
  try {
    // Fetch 100 repos from the GitHub API.
    const response = await fetch(
      `https://api.github.com/users/gregrickaby/repos?per_page=100`
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const repos = await response.json()

    // Verify data has repos.
    if (!repos || repos.length === 0) {
      throw new Error('No repos found.')
    }

    // Sort repositories by stargazers_count in descending order.
    const sortedRepos = repos.sort(
      (a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count
    )

    // Return the top N repos.
    return sortedRepos.slice(0, limit)
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Handle SEO for 404 pages.
 *
 * Used in the generateMetadata() function.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function notFoundSeoHandler(slug: string): Metadata {
  return {
    title: `404 Not Found - ${config.siteName}`,
    description: 'This content could not be found.',
    robots: {
      follow: false,
      index: false
    },
    alternates: {
      canonical: ''
    },
    openGraph: {
      title: `404 Not Found - ${config.siteName}`,
      description: 'This content could not be found.',
      url: `${config.siteUrl}/${slug}`
    }
  }
}

/**
 * Parse SEO data and return an object.
 *
 * Used in the generateMetadata() function.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function seoHandler(page: Page): Metadata {
  return {
    title: page.seo.title,
    description: page.seo.metaDesc,
    robots: {
      follow: page.seo.metaRobotsNofollow === 'follow',
      index: page.seo.metaRobotsNoindex === 'index'
    },
    alternates: {
      canonical: page.seo.canonical || config.siteUrl
    },
    openGraph: {
      title: page.seo.opengraphTitle,
      description: page.seo.opengraphDescription,
      url: page.seo.opengraphUrl,
      siteName: config.siteName,
      locale: 'en_US',
      type: page.seo.opengraphType,
      images: [
        {
          url: page?.seo?.opengraphImage?.sourceUrl,
          width: page?.seo?.opengraphImage?.mediaDetails?.width,
          height: page?.seo?.opengraphImage?.mediaDetails?.height,
          alt: page?.seo?.opengraphImage?.altText
        }
      ]
    }
  }
}
