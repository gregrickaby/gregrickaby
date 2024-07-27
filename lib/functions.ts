import {Metadata} from 'next'
import config from './config'
import {Post} from './types'

/**
 * Format a date.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    hourCycle: 'h23'
  }).format(new Date(date))
}

/**
 * Parse Yoast SEO data and transform it into Next.js Metadata.
 */
export function yoastSeo(post: Post): Metadata {
  return {
    metadataBase: new URL(config.siteUrl),
    title: post.yoast_head_json.title,
    description: post.yoast_head_json.og_description,
    robots: {
      follow: post.yoast_head_json.robots.follow === 'follow',
      index: post.yoast_head_json.robots.index === 'index'
    },
    alternates: {
      canonical: post.yoast_head_json.canonical
    },
    openGraph: {
      type: 'article',
      title: post.yoast_head_json.og_title,
      description: post.yoast_head_json.og_description,
      url: post.yoast_head_json.og_url,
      publishedTime: post.yoast_head_json.article_published_time,
      modifiedTime: post.yoast_head_json.article_modified_time,
      images: [
        {
          url: post.yoast_head_json.og_image[0].url,
          width: post.yoast_head_json.og_image[0].width,
          height: post.yoast_head_json.og_image[0].height,
          type: post.yoast_head_json.og_image[0].type,
          alt: 'article image'
        }
      ]
    }
  }
}
