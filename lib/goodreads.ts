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

const PROFILE_URL = `https://www.goodreads.com/user/show/${SITE.author.goodreadsUserId}`

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

/** The first capture of `pattern` in `html`, trimmed, with entities decoded. */
function readText(html: string, pattern: RegExp): string {
  return (pattern.exec(html)?.[1] ?? '')
    .trim()
    .replaceAll(/&(?:amp|lt|gt|quot|apos|#\d+|#[xX][\da-fA-F]+);/g, decodeEntity)
}

/**
 * Parses the "Currently Reading" box on Greg's profile page into books,
 * skipping entries without a title. Returns null when the page has no such
 * box, which means Goodreads changed its markup or served a sign-in page.
 */
export function parseShelf(html: string): Book[] | null {
  const section = /id="currentlyReadingReviews"([\s\S]*?)(?:bigBoxBottom|$)/.exec(html)?.[1]
  if (section === undefined) return null
  const books: Book[] = []
  for (const update of section.split('class="Updates').slice(1)) {
    const fullTitle = readText(update, /<a class="bookTitle"[^>]*>([^<]*)<\/a>/)
    const bookId = /<a class="bookTitle" href="\/book\/show\/(\d+)/.exec(update)?.[1]
    if (!fullTitle || !bookId) continue
    const series = /^(.*?)\s*\(([^()]*#[\d.]+)\)$/.exec(fullTitle)
    // The profile shows a 98px-wide thumbnail; the size suffix asks for the 475px-tall cover.
    const cover = /<img [^>]*src="(https:\/\/i\.gr-assets\.com\/[^"]+)"/.exec(update)?.[1]
    books.push({
      title: series?.[1] ?? fullTitle,
      series: series?.[2],
      author: readText(update, /<a class="authorName"[^>]*>([^<]*)<\/a>/),
      url: `https://www.goodreads.com/book/show/${bookId}`,
      cover: cover?.replace(/\._S[XY]\d+_\./, '._SY475_.'),
    })
  }
  return books
}

/**
 * The books Greg is reading now, from his public Goodreads profile page
 * (Goodreads dropped the shelf RSS feeds). Cached for four hours, so pages
 * stay prerendered and refresh in the background. A failed fetch logs, shows
 * no books, and caches that for 15 minutes so the next refresh retries soon.
 */
export async function getCurrentlyReading(): Promise<Book[]> {
  'use cache'
  try {
    const response = await fetch(PROFILE_URL)
    if (!response.ok) throw new Error(`Goodreads responded ${response.status}`)
    const books = parseShelf(await response.text())
    if (!books) throw new Error('Goodreads profile has no Currently Reading box')
    cacheLife({ revalidate: 4 * 60 * 60, expire: 7 * 24 * 60 * 60 })
    return books
  } catch (error) {
    cacheLife({ revalidate: 15 * 60, expire: 60 * 60 })
    logger.error('Could not load the Goodreads shelf', errorFields(error))
    return []
  }
}
