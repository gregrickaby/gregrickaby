declare global {
  interface Window {
    Fancybox: any
  }
}

export interface Comment {
  id: number
  post: number
  parent: number
  author: number
  author_name: string
  author_url: string
  date: string
  date_gmt: string
  content: {
    rendered: string
  }
  link: string
  status: string
  type: string
  author_avatar_urls: {
    '24': string
    '48': string
    '96': string
  }
  meta: any[]
  acf: any[]
}

export interface CommentsProps {
  postId: number
}

export interface SearchResults {
  id: number
  title: string
  url: string
  type: string
  subtype: string
}

/**
 * WordPress Post types generated by https://transform.tools/json-to-typescript
 */
export type Posts = Post[]

export interface Post {
  id: number
  date: string
  date_gmt: string
  guid: Guid
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: Title
  content: Content
  excerpt: Excerpt
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: Meta
  categories: number[]
  tags: number[]
  class_list: string[]
  category_names: CategoryName[]
  tag_names: TagName[]
  featured_image_data: FeaturedImageData
  author_name: string
  author_gravatar_url: string
  acf: Acf
  yoast_head: string
  yoast_head_json: YoastHeadJson
  _links: Links
}

export interface Guid {
  rendered: string
}

export interface Title {
  rendered: string
}

export interface Content {
  rendered: string
  protected?: boolean
}

export interface Excerpt {
  rendered: string
  protected?: boolean
}

export interface Meta {
  _acf_changed: boolean
  footnotes: string
}

export interface CategoryName {
  id: number
  name: string
}

export interface TagName {
  id: number
  name: string
}

export interface FeaturedImageData {
  url: string
  height: number
  width: number
  alt: string
}

export interface Acf {
  hide_featured_image?: boolean
  portfolio?: number[]
}

export interface YoastHeadJson {
  title: string
  robots: Robots
  canonical: string
  og_locale: string
  og_type: string
  og_title: string
  og_description: string
  og_url: string
  og_site_name: string
  article_published_time: string
  article_modified_time: string
  og_image: OgImage[]
  author: string
  twitter_card: string
  twitter_creator: string
  twitter_site: string
  twitter_misc: TwitterMisc
  schema: Schema
}

export interface Robots {
  index: string
  follow: string
  'max-snippet': string
  'max-image-preview': string
  'max-video-preview': string
}

export interface OgImage {
  url: string
  width: number
  height: number
  type: string
}

export interface TwitterMisc {
  'Written by': string
  'Est. reading time': string
}

export interface Schema {
  '@context': string
  '@graph': Graph[]
}

export interface Graph {
  '@type': any
  '@id': string
  isPartOf?: IsPartOf
  author?: Author
  headline?: string
  datePublished?: string
  dateModified?: string
  mainEntityOfPage?: MainEntityOfPage
  wordCount?: number
  commentCount?: number
  publisher?: Publisher
  image?: Image
  thumbnailUrl?: string
  keywords?: string[]
  articleSection?: string[]
  inLanguage?: string
  potentialAction?: PotentialAction[]
  url?: string
  name?: string
  primaryImageOfPage?: PrimaryImageOfPage
  breadcrumb?: Breadcrumb
  contentUrl?: string
  width?: number
  height?: number
  caption?: string
  itemListElement?: ItemListElement[]
  description?: string
  logo?: Logo
  sameAs?: string[]
}

export interface IsPartOf {
  '@id': string
}

export interface Author {
  name: string
  '@id': string
}

export interface MainEntityOfPage {
  '@id': string
}

export interface Publisher {
  '@id': string
}

export interface Image {
  '@type'?: string
  inLanguage?: string
  '@id': string
  url?: string
  contentUrl?: string
  width?: number
  height?: number
  caption?: string
}

export interface PotentialAction {
  '@type': string
  target: any
  'query-input'?: string
  name?: string
}

export interface PrimaryImageOfPage {
  '@id': string
}

export interface Breadcrumb {
  '@id': string
}

export interface ItemListElement {
  '@type': string
  position: number
  name: string
  item?: string
}

export interface Logo {
  '@id': string
}

export interface Links {
  self: Self[]
  collection: Collection[]
  about: About[]
  author: Author2[]
  replies: Reply[]
  'version-history': VersionHistory[]
  'predecessor-version': PredecessorVersion[]
  'wp:featuredmedia': Featuredmedum[]
  'wp:attachment': WpAttachment[]
  'wp:term': WpTerm[]
  curies: Cury[]
}

export interface Self {
  href: string
}

export interface Collection {
  href: string
}

export interface About {
  href: string
}

export interface Author2 {
  embeddable: boolean
  href: string
}

export interface Reply {
  embeddable: boolean
  href: string
}

export interface VersionHistory {
  count: number
  href: string
}

export interface PredecessorVersion {
  id: number
  href: string
}

export interface Featuredmedum {
  embeddable: boolean
  href: string
}

export interface WpAttachment {
  href: string
}

export interface WpTerm {
  taxonomy: string
  embeddable: boolean
  href: string
}

export interface Cury {
  name: string
  href: string
  templated: boolean
}

export interface Repo {
  id: number
  name: string
  description: string
  stargazers_count: number
  html_url: string
}

export interface CloudinaryResponse {
  resources: CloudinaryPhotos[]
}

export interface CloudinaryPhotos {
  asset_id: string
  public_id: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  bytes: number
  width: number
  height: number
  folder: string
  url: string
  secure_url: string
}

export interface Photo {
  id: number
  title: Title
  description: Description
  caption: Caption
  alt_text: string
  media_details: MediaDetails
  source_url: string
}

export interface Title {
  rendered: string
}

export interface Description {
  rendered: string
}

export interface Caption {
  rendered: string
}

export interface MediaDetails {
  width: number
  height: number
  file: string
  filesize: number
  sizes: Sizes
  image_meta: ImageMeta
}

export interface Sizes {
  medium: ImageDetails
  large?: ImImageDetailsage
  thumbnail: ImageDetails
  medium_large: ImageDetails
  '1536x1536': ImageDetails
  '2048x2048': ImageDetails
  'nineteen-twenty': Image
  full: Full
}

export interface ImageDetails {
  file: string
  width: number
  height: number
  filesize: number
  mime_type: string
  source_url: string
}

export interface Full {
  file: string
  width: number
  height: number
  mime_type: string
  source_url: string
}

export interface ImageMeta {
  aperture: string
  credit: string
  camera: string
  caption: string
  created_timestamp: string
  copyright: string
  focal_length: string
  iso: string
  shutter_speed: string
  title: string
  orientation: string
  keywords: string[]
}
