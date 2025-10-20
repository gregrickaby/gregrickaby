/**
 * WordPress GraphQL Types
 *
 * Fully typed interfaces for WordPress data including
 * Yoast SEO and Advanced Custom Fields support.
 */

/**
 * Utility types
 */
export type Maybe<T> = T | null
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: string
  Date: string
  JSON: Record<string, unknown>
}

/**
 * Pagination info for WordPress queries.
 */
export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: Maybe<string>
  endCursor: Maybe<string>
}

/**
 * Media item details.
 */
export interface MediaDetails {
  width?: number
  height?: number
  file?: string
  sizes?: Record<string, {file: string; width: number; height: number}>
}

/**
 * Featured image/media item.
 */
export interface MediaItem {
  id: string
  sourceUrl: string
  altText: Maybe<string>
  mediaDetails: Maybe<MediaDetails>
  sizes: Maybe<string>
  srcSet: Maybe<string>
  title?: Maybe<string>
  caption?: Maybe<string>
  description?: Maybe<string>
}

/**
 * Yoast SEO Open Graph image.
 */
export interface YoastSeoImage {
  sourceUrl: string
  altText: Maybe<string>
  mediaDetails: Maybe<{
    width: number
    height: number
  }>
}

/**
 * Yoast SEO schema data.
 */
export interface YoastSeoSchema {
  raw: Maybe<string>
}

/**
 * Yoast SEO metadata for posts.
 */
export interface PostTypeSEO {
  title: Maybe<string>
  metaDesc: Maybe<string>
  canonical: Maybe<string>
  opengraphTitle: Maybe<string>
  opengraphDescription: Maybe<string>
  opengraphImage: Maybe<YoastSeoImage>
  opengraphType: Maybe<string>
  opengraphUrl: Maybe<string>
  twitterTitle: Maybe<string>
  twitterDescription: Maybe<string>
  twitterImage: Maybe<YoastSeoImage>
  schema: Maybe<YoastSeoSchema>
  metaRobotsNoindex: Maybe<string>
  metaRobotsNofollow: Maybe<string>
  breadcrumbs: Maybe<
    Array<{
      text: string
      url: Maybe<string>
    }>
  >
}

/**
 * Author/User information.
 */
export interface Author {
  id: string
  databaseId: number
  name: string
  firstName: Maybe<string>
  lastName: Maybe<string>
  email: Maybe<string>
  description: Maybe<string>
  avatar: Maybe<{
    url: string
    size?: number
  }>
  url: Maybe<string>
  uri: Maybe<string>
  slug: Maybe<string>
}

/**
 * Category taxonomy.
 */
export interface Category {
  id: string
  databaseId: number
  name: string
  slug: string
  uri: Maybe<string>
  description: Maybe<string>
  count: Maybe<number>
  parent: Maybe<{
    node: Category
  }>
}

/**
 * Tag taxonomy.
 */
export interface Tag {
  id: string
  databaseId: number
  name: string
  slug: string
  uri: Maybe<string>
  description: Maybe<string>
  count: Maybe<number>
}

/**
 * Advanced Custom Fields (ACF) - Define your custom fields here.
 *
 * Example for a post with custom fields:
 */
export interface PostACF {
  // Add your ACF fields here based on your WordPress setup
  // Example:
  // featured?: boolean
  // customExcerpt?: string
  // relatedPosts?: Array<{id: string; title: string}>
  [key: string]: unknown
}

/**
 * WordPress Post.
 */
export interface Post {
  id: string
  databaseId: number
  title: Maybe<string>
  content: Maybe<string>
  excerpt: Maybe<string>
  slug: string
  uri: Maybe<string>
  date: string
  modified: string
  status: string
  commentStatus: Maybe<string>
  featuredImage: Maybe<{
    node: MediaItem
  }>
  author: Maybe<{
    node: Author
  }>
  categories: Maybe<{
    nodes: Array<Category>
  }>
  tags: Maybe<{
    nodes: Array<Tag>
  }>
  seo: Maybe<PostTypeSEO>
  acf: Maybe<PostACF>
  isSticky: Maybe<boolean>
  commentCount: Maybe<number>
  link: Maybe<string>
}

/**
 * Edge wrapper for posts in connections.
 */
export interface PostEdge {
  cursor: string
  node: Post
}

/**
 * Posts connection with pagination.
 */
export interface PostsConnection {
  pageInfo: PageInfo
  edges: Array<PostEdge>
  nodes: Array<Post>
}

/**
 * Query result for multiple posts.
 */
export interface GetPostsResult {
  posts: Maybe<PostsConnection>
}

/**
 * Query result for single post.
 */
export interface GetPostBySlugResult {
  post: Maybe<Post>
}

/**
 * Query result for all post slugs.
 */
export interface GetAllPostSlugsResult {
  posts: Maybe<{
    nodes: Array<{slug: string}>
  }>
}

/**
 * Query variables for fetching posts.
 */
export interface GetPostsVariables {
  first?: number
  after?: Maybe<string>
  before?: Maybe<string>
  last?: Maybe<number>
}

/**
 * Query variables for fetching a single post.
 */
export interface GetPostBySlugVariables {
  slug: string
}

/**
 * WordPress page (similar to Post but for pages).
 */
export interface Page {
  id: string
  databaseId: number
  title: Maybe<string>
  content: Maybe<string>
  slug: string
  uri: Maybe<string>
  date: string
  modified: string
  status: string
  featuredImage: Maybe<{
    node: MediaItem
  }>
  author: Maybe<{
    node: Author
  }>
  seo: Maybe<PostTypeSEO>
  acf: Maybe<Record<string, unknown>>
  parent: Maybe<{
    node: Page
  }>
  children: Maybe<{
    nodes: Array<Page>
  }>
}

/**
 * Type guards
 */
export function isPost(obj: unknown): obj is Post {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'slug' in obj
  )
}

export function hasMediaItem(
  image: Maybe<{node: MediaItem}>
): image is {node: MediaItem} {
  return image !== null && image !== undefined && image.node !== null
}

export function hasAuthor(
  author: Maybe<{node: Author}>
): author is {node: Author} {
  return author !== null && author !== undefined && author.node !== null
}
