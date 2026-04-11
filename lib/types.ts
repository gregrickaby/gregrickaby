/**
 * Frontmatter fields parsed from a post or page content.md file.
 *
 * @interface
 */
export interface PostMeta {
  /** The post or page title. */
  title: string
  /** The URL-safe slug for the post or page. */
  slug: string
  /** The ISO 8601 date when the post was published. */
  date: string
  /** The ISO 8601 date when the post was last modified. */
  modified: string
  /** The type of content - either 'post' or 'page'. */
  type: 'post' | 'page'
  /** Optional. A short description for SEO and previews. */
  description?: string
  /** Optional. The filename of the featured image. */
  featuredImage?: string
  /** Optional. Categories assigned to the post. */
  categories?: string[]
  /** Optional. Tags assigned to the post. */
  tags?: string[]
}

/**
 * A fully-loaded post or page, including rendered HTML content.
 *
 * @interface
 */
export interface Post {
  /** The post metadata. */
  meta: PostMeta
  /** The rendered HTML content. */
  content: string
}

/**
 * State shape for the contact form server action.
 *
 * @interface
 */
export interface ContactFormState {
  /** Whether the form submission was successful. */
  success: boolean
  /** The error message if submission failed, otherwise null. */
  error: string | null
}

/**
 * The initial state for the contact form.
 *
 * @constant
 */
export const INITIAL_STATE: ContactFormState = {success: false, error: null}
