import {Post} from '@/lib/types'

/**
 * WP_Query arguments.
 */
interface WP_QueryArgs {
  /** Optional. A post type slug to query. Defaults to 'posts'. */
  post_type?: 'posts' | 'pages'
  /** Optional. Number of posts to return per page. Defaults to 10. */
  per_page?: number
  /** Optional. Current page of the query. Defaults to 1. */
  paged?: number
  /** Optional. Field to order the posts by. Defaults to 'date'. */
  orderby?:
    | 'author'
    | 'date'
    | 'id'
    | 'include'
    | 'include_slugs'
    | 'modified'
    | 'parent'
    | 'relevance'
    | 'slug'
    | 'title'
  /** Optional. Order direction of the query. 'asc' for ascending, 'desc' for descending. Defaults to 'desc'. */
  order?: 'asc' | 'desc'
  /** Optional. A search term to query posts by. */
  search?: string
  /** Optional. Array of fields to include in the response. */
  fields?: Array<
    | 'acf'
    | 'author_gravatar_url'
    | 'author_name'
    | 'category_names'
    | 'content'
    | 'date'
    | 'excerpt'
    | 'featured_image_data'
    | 'id'
    | 'slug'
    | 'status'
    | 'tag_names'
    | 'title'
    | 'yoast_head_json'
  >
  /** Optional. The post or page slug to query. */
  slug?: string
  /** Optional. Scope under which the request is made; determines fields present in response. */
  context?: 'view' | 'embed' | 'edit'
  /** Optional. ISO8601 compliant date to filter posts after. */
  after?: string
  /** Optional. ISO8601 compliant date to filter posts before. */
  before?: string
  /** Optional. Limit response to posts published after a given modified date. */
  modified_after?: string
  /** Optional. Limit response to posts published before a given modified date. */
  modified_before?: string
  /** Optional. Limit result set to posts assigned to specific authors. */
  author?: number
  /** Optional. Ensure result set excludes posts assigned to specific authors. */
  author_exclude?: number
  /** Optional. Limit result set to specific post IDs. */
  include?: number
  /** Optional. Ensure result set excludes specific post IDs. */
  exclude?: number
  /** Optional. Offset the result set by a specific number of items. */
  offset?: number
  /** Optional. Limit result set to posts with one or more specific statuses. */
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private'
  /** Optional. Limit result set to posts assigned one or more categories. */
  categories?: string
  /** Optional. Ensure result set excludes posts assigned to specific categories. */
  categories_exclude?: string
  /** Optional. Limit result set to posts assigned one or more tags. */
  tags?: string
  /** Optional. Ensure result set excludes posts assigned to specific tags. */
  tags_exclude?: string
  /** Optional. Limit result set to posts with sticky flag set. */
  sticky?: boolean
  /** Optional. Limit result set to posts with a specific parent ID. */
  parent?: number
  /** Optional. Ensure result set excludes posts with a specific parent ID. */
  parent_exclude?: number
  /** Optional. Search criteria to select specific taxonomy terms. */
  tax_relation?: 'AND' | 'OR'
  /** Optional. Order by menu order. */
  menu_order?: number
  /** Optional. Columns to search. Defaults to 'all'. */
  search_columns?: string
  /** Optional. Any additional arguments. */
  [key: string]: any
}

/**
 * WP_Query class.
 */
export class WP_Query {
  /**
   * The endpoint to query.
   */
  private endpoint: string

  /**
   * The post type to query.
   */
  private postType: WP_QueryArgs['post_type']

  /**
   * The query parameters.
   */
  private params: WP_QueryArgs

  /**
   * Constructs a new WP_Query instance.
   *
   * ### Usage
   *
   * Fetch posts or custom post types from a WordPress REST API endpoint.
   * Loosely based on the WP_Query class in WordPress, but uses WP REST API
   * arguments instead.
   *
   * ```typescript
   * const query = new WP_Query({
   *  post_type: 'posts',
   *  per_page: 10,
   *  fields: ['id', 'title', 'excerpt', 'slug'],
   * });
   *
   * const posts = await query.getPosts()
   * ```
   *
   * @see https://developer.wordpress.org/rest-api/reference/posts/#arguments
   *
   * @param args - The arguments used to configure the query.
   * @param endpoint - The endpoint to query. Defaults to WP_Query.defaultEndpoint.
   */
  constructor(args: WP_QueryArgs = {}, endpoint: string = '') {
    this.endpoint = endpoint || 'https://blog.gregrickaby.com/wp-json/wp/v2'
    this.postType = args.post_type || 'posts'
    this.params = {
      // Set default query parameters.
      context: 'view',
      order: 'desc',
      orderby: 'date',
      page: 1,
      per_page: 10,
      status: 'publish',
      // Merge with user-provided query parameters.
      ...args
    }
  }

  /**
   * Fetches posts from the WordPress REST API using the constructed query URL.
   *
   * @returns A promise that resolves to an array of Post objects.
   */
  public async getPosts(): Promise<Post[]> {
    // Get the query URL.
    const url = this.buildQuery()

    try {
      // Send the request to the WordPress API.
      const response = await fetch(url, {
        next: {
          revalidate: 86400, // 1 hour.
          tags: [(this.params.slug && `${this.params.slug}`) || '']
        }
      })

      // If the response is not OK, throw an error.
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, url: ${url}`)
      }

      // Parse the JSON response.
      const data: Post[] = await response.json()

      // If there are no posts, throw an error.
      if (!data || data.length === 0) {
        throw new Error(`No posts found for url: ${url}`)
      }

      // Return the data.
      return data
    } catch (error) {
      console.error(error)
      return []
    }
  }

  /**
   * Builds the base URL from the provided parameters.
   *
   * @returns The constructed base URL.
   */
  private buildBaseUrl(): URL {
    return new URL(`${this.endpoint}/${this.postType}`)
  }

  /**
   * Adds query parameters to the base URL.
   *
   * @param baseUrl - The base URL.
   * @returns The URL with query parameters appended.
   */
  private addQueryParams(baseUrl: URL): URL {
    // Create a new URLSearchParams object.
    const queryParams = new URLSearchParams()

    // Loop through each parameter.
    Object.entries(this.params).forEach(([key, value]) => {
      // If the key is 'fields' and the value is an array with more than one item.
      if (key === 'fields' && Array.isArray(value) && value.length > 0) {
        // Append the key and value to the query.
        queryParams.append(key, value.join(','))

        // If the value is empty (or a post type) ignore it.
      } else if (value !== undefined && value !== '' && key !== 'post_type') {
        // Append the key and value to the query.
        queryParams.append(key, value.toString())
      }
    })

    // Append the query parameters to the URL.
    baseUrl.search = queryParams.toString()

    // Return the URL.
    return baseUrl
  }

  /**
   * Builds the query string from the provided parameters.
   *
   * @returns The constructed query URL.
   */
  private buildQuery(): string {
    // Build the base URL.
    const baseUrl = this.buildBaseUrl()

    // Add the query parameters to the URL.
    const finalUrl = this.addQueryParams(baseUrl)

    // Return the final URL as a string.
    return finalUrl.toString()
  }
}
