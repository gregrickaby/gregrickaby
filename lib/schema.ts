import {siteConfig} from './config'
import type {PostMeta} from './types'
import {getFeaturedImagePath} from './utils'

const PERSON_ID = `${siteConfig.url}/#person`
const WEBSITE_ID = `${siteConfig.url}/#website`

/** A single node within a JSON-LD `@graph` array. */
interface SchemaNode {
  '@type': string | string[]
  '@id': string
  [key: string]: unknown
}

/** JSON-LD graph output safe for embedding in a `<script type="application/ld+json">` tag. */
export interface SchemaGraph {
  '@context': string
  '@graph': SchemaNode[]
}

/**
 * Builds a two-item BreadcrumbList node (Home → the given page) shared by
 * `buildBlogPostingGraph` and `buildWebPageGraph`.
 *
 * @param breadcrumbId - The `@id` for the BreadcrumbList node.
 * @param pageUrl - The absolute URL of the second breadcrumb item.
 * @param pageTitle - The display name of the second breadcrumb item.
 * @returns A `SchemaNode` representing the BreadcrumbList.
 */
function buildBreadcrumbList(
  breadcrumbId: string,
  pageUrl: string,
  pageTitle: string
): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      {
        '@type': 'ListItem',
        '@id': `${siteConfig.url}/#breadcrumb-1`,
        position: 1,
        name: 'Home',
        item: siteConfig.url
      },
      {
        '@type': 'ListItem',
        '@id': `${pageUrl}/#breadcrumb-2`,
        position: 2,
        name: pageTitle,
        item: pageUrl
      }
    ]
  }
}

/**
 * Builds the site-wide JSON-LD graph containing WebSite and Person/Organization nodes.
 * Render once in `app/layout.tsx`.
 *
 * @returns A `SchemaGraph` with WebSite and Person nodes.
 */
export function buildWebSiteGraph(): SchemaGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {'@id': PERSON_ID},
        inLanguage: 'en-US'
      },
      {
        '@type': ['Person', 'Organization'],
        '@id': PERSON_ID,
        name: siteConfig.author.name,
        url: siteConfig.author.url,
        description: siteConfig.description,
        sameAs: [siteConfig.author.linkedin, siteConfig.author.github]
      }
    ]
  }
}

/**
 * Builds the JSON-LD graph for a blog post, including BlogPosting, WebPage, and BreadcrumbList nodes.
 * Render in `app/[slug]/page.tsx`.
 *
 * @param meta - The post metadata from frontmatter.
 * @returns A `SchemaGraph` with BlogPosting, WebPage, and BreadcrumbList nodes.
 */
export function buildBlogPostingGraph(meta: PostMeta): SchemaGraph {
  const featuredImage = getFeaturedImagePath(meta)
  const postUrl = `${siteConfig.url}/${meta.slug}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}/#article`,
        url: postUrl,
        headline: meta.title,
        name: meta.title,
        ...(meta.description && {description: meta.description}),
        datePublished: meta.date,
        dateModified: meta.modified,
        author: {'@id': PERSON_ID},
        publisher: {'@id': PERSON_ID},
        isPartOf: {'@id': `${postUrl}/#webpage`},
        ...(featuredImage && {
          image: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}${featuredImage}`,
            contentUrl: `${siteConfig.url}${featuredImage}`
          }
        }),
        inLanguage: 'en-US'
      },
      {
        '@type': 'WebPage',
        '@id': `${postUrl}/#webpage`,
        url: postUrl,
        name: meta.title,
        isPartOf: {'@id': WEBSITE_ID},
        datePublished: meta.date,
        dateModified: meta.modified,
        breadcrumb: {'@id': `${postUrl}/#breadcrumb`},
        inLanguage: 'en-US'
      },
      buildBreadcrumbList(`${postUrl}/#breadcrumb`, postUrl, meta.title)
    ]
  }
}

/**
 * Input for buildWebPageGraph.
 *
 * @interface
 */
export interface WebPageGraphInput {
  /** The page title. */
  title: string
  /** The page description. */
  description: string
  /** The URL path segment relative to the site root (e.g. `'about'`). */
  path: string
}

/**
 * Builds the JSON-LD graph for a static page, including WebPage and BreadcrumbList nodes.
 * Render in static page components such as `app/about/page.tsx`.
 *
 * @param params - Page title, description, and the URL path segment (e.g. `'about'`).
 * @returns A `SchemaGraph` with WebPage and BreadcrumbList nodes.
 */
export function buildWebPageGraph({
  title,
  description,
  path
}: WebPageGraphInput): SchemaGraph {
  const pageUrl = `${siteConfig.url}/${path}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}/#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: {'@id': WEBSITE_ID},
        breadcrumb: {'@id': `${pageUrl}/#breadcrumb`},
        inLanguage: 'en-US'
      },
      buildBreadcrumbList(`${pageUrl}/#breadcrumb`, pageUrl, title)
    ]
  }
}

/**
 * Serializes a schema graph to a JSON-LD string safe for `dangerouslySetInnerHTML`.
 * Replaces `<`, `>`, and `&` with their Unicode escapes to prevent XSS injection.
 *
 * @param graph - The `SchemaGraph` to serialize.
 * @returns A JSON string with `<`, `>`, and `&` replaced by their Unicode escapes.
 */
export function serializeSchema(graph: SchemaGraph): string {
  return JSON.stringify(graph)
    .replaceAll('<', String.raw`\u003c`)
    .replaceAll('>', String.raw`\u003e`)
    .replaceAll('&', String.raw`\u0026`)
}
