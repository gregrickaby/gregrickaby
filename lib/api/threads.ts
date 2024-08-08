// Types generated with: https://transform.tools/json-to-typescript

export interface Threads {
  data: Thread[]
  paging: Paging
}

export interface Thread {
  id: string
  media_product_type: string
  media_type: string
  media_url: string
  permalink: string
  text: string
  timestamp: string
  username: string
  is_quote_post: boolean
  children?: Children
}

export interface Children {
  data: Thread2[]
}

export interface Thread2 {
  id: string
}

export interface Paging {
  cursors: Cursors
  next: string
}

export interface Cursors {
  before: string
  after: string
}

/**
 * Get the latest posts from Threads.
 */
export async function getThreads(posts: number): Promise<Threads> {
  // Create a new URL object for the Threads API endpoint.
  const url = new URL('https://graph.threads.net/v1.0/me/threads')

  // Add the field query parameters to specify which fields to include in the response.
  url.searchParams.append(
    'fields',
    'id,is_quote_post,media_product_type,media_type,media_url,permalink,text,timestamp,username'
  )

  // Add the limit query parameter to specify the number of posts to retrieve.
  url.searchParams.append('limit', posts.toString())

  // Get the access token from the environment variables.
  const accessToken = process.env.THREADS_ACCESS_TOKEN

  // If the access token is not set, throw an error.
  if (!accessToken) {
    throw new Error('Access token is not set in environment variables!')
  }

  // Add the access token to the query parameters.
  url.searchParams.append('access_token', accessToken)

  try {
    // Send the request to the Threads API.
    const response = await fetch(url.toString())

    // If the response is not ok, throw an error.
    if (!response.ok) {
      throw new Error(`Error fetching threads: ${response.statusText}`)
    }

    // Parse the response JSON.
    const threads: Threads = await response.json()

    // If there is no data or the data is empty, throw an error.
    if (!threads.data || threads.data.length === 0) {
      throw new Error('No data returned')
    }

    // Filter out threads that are quote posts.
    threads.data = threads.data.filter((thread) => !thread.is_quote_post)

    // Filter out threads that don't have a media URL.
    threads.data = threads.data.filter((thread) => thread.media_url)

    // Return the filtered data.
    return threads
  } catch (error) {
    console.error('Unexpected error fetching threads:', error)
    throw new Error('Unexpected error fetching threads')
  }
}
