import {Post} from '@/lib/types'

/**
 * Interface defining the structure of the arguments used to configure the WP_Query.
 */
interface WP_QueryArgs {
  post_type?: string
  posts_per_page?: number
  page?: number
  orderby?: string
  order?: 'asc' | 'desc'
  search?: string
  categories?: string
  tags?: string
  fields?: string
  [key: string]: any
}

/**
 * WP_Query class to fetch posts or custom post types from a WordPress REST API endpoint.
 */
export class WP_Query {
  static defaultEndpoint: string = 'https://blog.gregrickaby.com/wp-json/wp/v2'
  private endpoint: string
  private postType: string
  private params: WP_QueryArgs

  /**
   * Constructs a new WP_Query instance.
   *
   * @param args - The arguments used to configure the query.
   */
  constructor(
    args: WP_QueryArgs = {},
    endpoint: string = WP_Query.defaultEndpoint
  ) {
    this.endpoint = endpoint
    this.postType = args.post_type || 'posts'
    this.params = {
      per_page: args.posts_per_page || 10,
      page: args.page || 1,
      orderby: args.orderby || 'date',
      order: args.order || 'desc',
      search: args.search || '',
      categories: args.categories || '',
      tags: args.tags || '',
      fields: args._fields || '',
      ...args
    }
  }

  /**
   * Builds the query string from the provided parameters.
   *
   * @returns The constructed query URL.
   */
  private buildQuery(): string {
    const query = new URLSearchParams()
    Object.entries(this.params).forEach(([key, value]) => {
      if (value) {
        query.append(key, value.toString())
      }
    })
    return `${this.endpoint}/${this.postType}?${query.toString()}`
  }

  /**
   * Fetches posts from the WordPress REST API using the constructed query URL.
   *
   * @returns A promise that resolves to an array of WP_Post objects.
   */
  public async getPosts(): Promise<Post[]> {
    const url = this.buildQuery()
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Post[] = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }
}
