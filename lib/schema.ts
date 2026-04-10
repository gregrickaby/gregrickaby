import {siteConfig} from './config'
import type {PostMeta} from './types'
import {getFeaturedImagePath} from './utils'

const PERSON_ID = `${siteConfig.url}/#person`
const WEBSITE_ID = `${siteConfig.url}/#website`

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
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}/#breadcrumb`,
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
            '@id': `${postUrl}/#breadcrumb-2`,
            position: 2,
            name: meta.title,
            item: postUrl
          }
        ]
      }
    ]
  }
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
}: {
  title: string
  description: string
  path: string
}): SchemaGraph {
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
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}/#breadcrumb`,
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
            name: title,
            item: pageUrl
          }
        ]
      }
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
