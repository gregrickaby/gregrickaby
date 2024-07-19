export interface Post {
  id: number
  date: Date
  slug: string
  status: string
  title: Title
  content: Content
  excerpt: Content
  category_names: Name[]
  tag_names: Name[]
  featured_image_data: FeaturedImageData
  acf: Acf
  yoast_head_json: YoastHeadJSON
}

export interface Acf {
  hide_featured_image: boolean
}

export interface Name {
  id: number
  name: string
}

export interface Content {
  rendered: string
  protected: boolean
}

export interface FeaturedImageData {
  url: string
  height: number
  width: number
  alt?: string
  type?: string
}

export interface Title {
  rendered: string
}

export interface YoastHeadJSON {
  title: string
  robots: Robots
  og_locale: string
  og_type: string
  og_title: string
  og_description: string
  og_url: string
  og_site_name: string
  article_published_time: Date
  article_modified_time: Date
  og_image: FeaturedImageData[]
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

export interface Schema {
  '@context': string
  '@graph': Graph[]
}

export interface Graph {
  '@type': string[] | string
  '@id': string
  isPartOf?: Breadcrumb
  author?: Author
  headline?: string
  datePublished?: Date
  dateModified?: Date
  mainEntityOfPage?: Breadcrumb
  wordCount?: number
  commentCount?: number
  publisher?: Breadcrumb
  image?: Image
  thumbnailUrl?: string
  keywords?: string[]
  articleSection?: string[]
  inLanguage?: string
  potentialAction?: PotentialAction[]
  url?: string
  name?: string
  primaryImageOfPage?: Breadcrumb
  breadcrumb?: Breadcrumb
  contentUrl?: string
  width?: number
  height?: number
  caption?: string
  itemListElement?: ItemListElement[]
  description?: string
  logo?: Breadcrumb
  sameAs?: string[]
}

export interface Author {
  name: string
  '@id': string
}

export interface Breadcrumb {
  '@id': string
}

export interface Image {
  '@id': string
  '@type'?: string
  inLanguage?: string
  url?: string
  contentUrl?: string
  width?: number
  height?: number
  caption?: string
}

export interface ItemListElement {
  '@type': string
  position: number
  name: string
  item?: string
}

export interface PotentialAction {
  '@type': string
  name?: string
  target: string[] | TargetClass
  'query-input'?: string
}

export interface TargetClass {
  '@type': string
  urlTemplate: string
}

export interface TwitterMisc {
  'Written by': string
}

export interface GitHubRepo {
  name: string
  stargazers_count: number
  html_url: string
  description: string
  id: number
}

export interface QueryParams {
  endpoint: string
  query: string
  posts_per_page?: number
}
