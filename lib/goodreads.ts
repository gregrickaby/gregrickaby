import 'server-only'

import { cacheLife } from 'next/cache'

import { errorFields, logger } from './datadog/server'
import { SITE } from './site'

/** A book on Greg's Goodreads "currently-reading" shelf. */
export interface Book {
  title: string
  /** The series and number, such as "Bobiverse, #3", split out of the title. */
  series?: string
  author: string
  url: string
  /** A 475px-tall cover on i.gr-assets.com, the host next.config.ts allows. */
  cover?: string
}

const FEED_URL = `https://www.goodreads.com/review/list_rss/${SITE.author.goodreadsUserId}?shelf=currently-reading`

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
}

/** A named entity from the list above, or a numeric one such as `&#8217;`. */
function decodeEntity(entity: string): string {
  const code = /^&#(x?)([\da-f]+);$/i.exec(entity)
  return code ? String.fromCodePoint(parseInt(code[2]!, code[1] ? 16 : 10)) : ENTITIES[entity]!
}

/** The text of `<tag>` in an RSS item, with or without CDATA. */
function readTag(item: string, tag: string): string {
  const match = new RegExp(
    `<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`,
  ).exec(item)
  return (match?.[1] ?? '')
    .trim()
    .replaceAll(/&(?:amp|lt|gt|quot|apos|#\d+|#[xX][\da-fA-F]+);/g, decodeEntity)
}

/** Parses the shelf's RSS into books, skipping items without a title. */
export function parseShelf(xml: string): Book[] {
  const books: Book[] = []
  for (const [, item = ''] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const fullTitle = readTag(item, 'title')
    if (!fullTitle) continue
    const series = /^(.*?)\s*\(([^()]*#[\d.]+)\)$/.exec(fullTitle)
    const cover = readTag(item, 'book_large_image_url')
    const bookId = readTag(item, 'book_id')
    books.push({
      title: series?.[1] ?? fullTitle,
      series: series?.[2],
      author: readTag(item, 'author_name'),
      url: bookId ? `https://www.goodreads.com/book/show/${bookId}` : readTag(item, 'link'),
      cover: cover.startsWith('https://i.gr-assets.com/') ? cover : undefined,
    })
  }
  return books
}

/**
 * The books Greg is reading now, from Goodreads' public RSS feed. Cached for
 * four hours, so pages stay prerendered and refresh in the background. A
 * failed fetch logs and shows no books instead of breaking the home page.
 */
export async function getCurrentlyReading(): Promise<Book[]> {
  'use cache'
  cacheLife({ revalidate: 4 * 60 * 60, expire: 7 * 24 * 60 * 60 })
  try {
    const response = await fetch(FEED_URL)
    if (!response.ok) throw new Error(`Goodreads responded ${response.status}`)
    return parseShelf(await response.text())
  } catch (error) {
    logger.error('Could not load the Goodreads shelf', errorFields(error))
    return []
  }
}
