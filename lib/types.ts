/** Frontmatter fields parsed from a post or page content.md file. */
export interface PostMeta {
  title: string
  slug: string
  date: string
  modified: string
  type: 'post' | 'page'
  description?: string
  featuredImage?: string
  categories?: string[]
  tags?: string[]
}

/** A fully-loaded post or page, including rendered HTML content. */
export interface Post {
  meta: PostMeta
  content: string
}

/** State shape for the contact form server action. */
export interface ContactFormState {
  success: boolean
  error: string | null
}

export const INITIAL_STATE: ContactFormState = {success: false, error: null}
