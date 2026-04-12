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

/**
 * GPS coordinates for a photo.
 *
 * @interface
 */
export interface GpsCoordinates {
  /** Latitude in decimal degrees. */
  latitude: number
  /** Longitude in decimal degrees. */
  longitude: number
}

/**
 * Metadata for a photo in the /photos gallery, derived from EXIF/IPTC data.
 *
 * @interface
 */
export interface PhotoMeta {
  /** The image filename (e.g. "sunset.jpg"). */
  filename: string
  /** The photo title from IPTC ObjectName, or a formatted version of the filename. */
  title: string
  /** Optional. The caption/description from IPTC Caption-Abstract. */
  caption?: string
  /** Image width in pixels. */
  width: number
  /** Image height in pixels. */
  height: number
  /** Optional. Camera make and model (e.g. "Canon EOS R5"). */
  camera?: string
  /** Optional. Lens model (e.g. "RF 70-200mm F2.8L IS USM"). */
  lens?: string
  /** Optional. Aperture f-stop value (e.g. "f/2.8"). */
  aperture?: string
  /** Optional. Shutter speed (e.g. "1/250s"). */
  shutterSpeed?: string
  /** Optional. ISO sensitivity (e.g. "400"). */
  iso?: string
  /** Optional. Focal length (e.g. "200mm"). */
  focalLength?: string
  /** Optional. Date the photo was taken (ISO 8601). */
  dateTaken?: string
  /** Optional. GPS coordinates. */
  gps?: GpsCoordinates
}
