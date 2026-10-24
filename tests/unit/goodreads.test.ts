import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCurrentlyReading, parseShelf } from '@/lib/goodreads'

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))

function item(fields: Record<string, string>) {
  return `<item>${Object.entries(fields)
    .map(([tag, value]) => `<${tag}>${value}</${tag}>`)
    .join('\n')}</item>`
}

const FEED = `<rss><channel><title>Greg's bookshelf</title>
${item({
  title: "<![CDATA[The Butcher's Masquerade (Dungeon Crawler Carl, #5)]]>",
  author_name: 'Matt Dinniman',
  book_id: '60233239',
  book_large_image_url: '<![CDATA[https://i.gr-assets.com/images/S/books/60233239._SY475_.jpg]]>',
})}
${item({
  title: '<![CDATA[Project Hail Mary]]>',
  author_name: 'Andy Weir &amp; O&#8217;Brien&#x2019;s &apos;Friends&apos;',
  link: '<![CDATA[https://www.goodreads.com/review/show/1]]>',
  book_large_image_url: 'https://s.gr-assets.com/assets/nophoto/book/111x148.png',
})}
${item({ title: '', author_name: 'Nobody' })}
</channel></rss>`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseShelf', () => {
  it('splits the series out of the title and links to the book page', () => {
    expect(parseShelf(FEED)[0]).toEqual({
      title: "The Butcher's Masquerade",
      series: 'Dungeon Crawler Carl, #5',
      author: 'Matt Dinniman',
      url: 'https://www.goodreads.com/book/show/60233239',
      cover: 'https://i.gr-assets.com/images/S/books/60233239._SY475_.jpg',
    })
  })

  it('falls back to the review link, decodes entities, and drops covers from other hosts', () => {
    expect(parseShelf(FEED)[1]).toEqual({
      title: 'Project Hail Mary',
      series: undefined,
      author: "Andy Weir & O\u2019Brien\u2019s 'Friends'",
      url: 'https://www.goodreads.com/review/show/1',
      cover: undefined,
    })
  })

  it('skips items without a title', () => {
    expect(parseShelf(FEED)).toHaveLength(2)
    expect(parseShelf('<rss></rss>')).toEqual([])
  })
})

describe('getCurrentlyReading', () => {
  it('fetches and parses the shelf', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(FEED)),
    )
    expect(await getCurrentlyReading()).toHaveLength(2)
  })

  it('shows no books when Goodreads fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 })),
    )
    expect(await getCurrentlyReading()).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})
