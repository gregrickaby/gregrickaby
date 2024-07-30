import type {Post} from '@/lib/types'

/**
 * WP_Query arguments.
 */
interface WP_QueryArgs {
  /** Optional. A post type slug to query. Defaults to 'posts'. */
  post_type?: 'posts' | 'pages' | string
  /** Optional. Number of posts to return per page. Defaults to 10. */
  per_page?: number
  /** Optional. Current page of the query. Defaults to 1. */
  paged?: number
  /** Optional. Field to order the posts by. Defaults to 'date'. */
  orderby?: string
  /** Optional. Order direction of the query. 'asc' for ascending, 'desc' for descending. Defaults to 'desc'. */
  order?: 'asc' | 'desc'
  /** Optional. A search term to query posts by. */
  search?: string
  /** Optional. Comma-separated list of fields to include in the response. */
  fields?: string
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
  status?: string
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
  tax_relation?: string
  /** Optional. Order by menu order. */
  menu_order?: number
  /** Optional. Columns to search. Defaults to 'all'. */
  search_columns?: string
  /** Optional. Any additional arguments. */
  [key: string]: any
}
/**
 * WP_Query class
 *
 * Fetch posts or custom post types from a WordPress REST API endpoint.
 *
 * Loosely based on the WP_Query class in WordPress, but uses WP REST API arguments.
 *
 * @see https://developer.wordpress.org/rest-api/reference/posts/#arguments
 * @see https://developer.wordpress.org/reference/classes/WP_Query/parse_query/
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
   * @param endpoint - The endpoint to query. Defaults to WP_Query.defaultEndpoint.
   */
  constructor(
    args: WP_QueryArgs = {},
    endpoint: string = WP_Query.defaultEndpoint
  ) {
    this.endpoint = endpoint
    this.postType = args.post_type || 'posts'
    this.params = {
      after: args.after,
      author: args.author,
      author_exclude: args.author_exclude,
      before: args.before,
      categories: args.categories,
      categories_exclude: args.categories_exclude,
      context: args.context || 'view',
      exclude: args.exclude,
      fields: args.fields,
      include: args.include,
      menu_order: args.menu_order,
      modified_after: args.modified_after,
      modified_before: args.modified_before,
      offset: args.offset,
      order: args.order || 'desc',
      orderby: args.orderby || 'date',
      page: args.page || 1,
      parent: args.parent,
      parent_exclude: args.parent_exclude,
      per_page: args.per_page || 10,
      search: args.search,
      search_columns: args.search_columns,
      slug: args.slug,
      status: args.status || 'publish',
      sticky: args.sticky,
      tags_exclude: args.tags_exclude,
      tax_relation: args.tax_relation,
      ...args
    }
  }

  /**
   * Fetches posts from the WordPress REST API using the constructed query URL.
   *
   * ### Usage
   *
   * ```typescript
   * const query = new WP_Query({
   *  post_type: 'posts',
   *  posts_per_page: 10,
   *  fields: 'id,title,excerpt,slug',
   * });
   *
   * query.getPosts().then(posts => {
   *   console.log(posts);
   * });
   * ```
   *
   * @returns A promise that resolves to an array of Post objects.
   */
  public async getPosts(): Promise<Post[]> {
    const url = this.buildQuery()
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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

  /**
   * Builds the query string from the provided parameters.
   *
   * @returns The constructed query URL.
   */
  private buildQuery(): string {
    const query = new URLSearchParams()
    Object.entries(this.params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'post_type') {
        query.append(key, value.toString())
      }
    })
    return `${this.endpoint}/${this.postType}?${query.toString()}`
  }
}
