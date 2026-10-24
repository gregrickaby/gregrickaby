import type { ComponentType } from 'react'

/** A local image with its intrinsic size, measured at build time. */
export interface ImageAsset {
  /** Path under `public/`, such as `/content/posts/slug/photo.jpg`. */
  src: string
  width: number
  height: number
}

/** Frontmatter for a post or page. */
export interface PostMeta {
  title: string
  slug: string
  /** ISO 8601 publish date. */
  date: string
  /** ISO 8601 last-modified date. */
  modified: string
  type: 'post' | 'page'
  description?: string
  featuredImage?: ImageAsset
  categories?: string[]
  tags?: string[]
  /** Estimated minutes to read the body, at 230 words a minute. */
  readingMinutes?: number
}

/** An h2 or h3 in a post body, for the table of contents. */
export interface Heading {
  /** The heading's `id`, set at build time. */
  id: string
  text: string
  depth: 2 | 3
}

/**
 * An interactive demo a post places with `<div data-demo="name"></div>`. Each
 * post lists its own in `components/islands/demos/<slug>/registry.ts`.
 */
export interface DemoEntry {
  title: string
  Body: ComponentType
}

/** A post or page with its HTML, rendered and sanitized at build time. */
export interface Post {
  meta: PostMeta
  html: string
  /** The body's h2 and h3 headings, in order. */
  headings: Heading[]
  /** The featured image to show above the body, or null when the body already opens with it. */
  hero: ImageAsset | null
}

/** A photo in the /photos gallery, with EXIF and IPTC fields read at build time. */
export interface Photo extends ImageAsset {
  filename: string
  title: string
  caption?: string
  camera?: string
  lens?: string
  aperture?: string
  shutterSpeed?: string
  iso?: string
  focalLength?: string
  /** ISO 8601 capture time. */
  dateTaken?: string
  /** True when the JPEG carries an HDR gain map, which the image optimizer would strip. */
  hdr: boolean
}

/** Everything `scripts/build-content.ts` writes to `.generated/content.json`. */
export interface ContentIndex {
  /** ISO 8601 build time. */
  generatedAt: string
  /** Newest first. */
  posts: Post[]
  pages: Post[]
  /** Newest first. */
  photos: Photo[]
}

/** One job in the resume timeline. */
export interface ResumeEntry {
  role: string
  company: string
  companyUrl?: string
  location: string
  /** Human-readable range, such as "February 2024 – Present". */
  dateRange: string
  summary: string
  highlights: string[]
  techStack: string[]
}
