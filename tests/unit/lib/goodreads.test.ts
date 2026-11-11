import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCurrentlyReading, parseShelf } from '@/lib/goodreads'

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))

function update({ id, title, author, cover }: Record<string, string | undefined>) {
  return `<div class="Updates no_border">
  <div class="firstcol">
    <a title="${title}" href="/book/show/${id}-slug">${cover ? `<img alt="" src="${cover}" />` : ''}</a>
  </div>
  <div class="secondcol">
    <div><a class="bookTitle" href="/book/show/${id}-slug">${title}</a></div>
    <div><span class="by smallText">by</span> <a class="authorName" href="/author/show/1">${author}</a></div>
  </div>
</div>`
}

const PROFILE = `<html><body>
<div class="bigBox"><div class="bigBoxBody"><div id="currentlyReadingReviews">
${update({
  id: '60233239',
  title: 'The Butcher&#39;s Masquerade (Dungeon Crawler Carl, #5)',
  author: 'Matt Dinniman',
  cover:
    'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1734202962l/60233239._SX98_.jpg',
})}
${update({
  id: '54493401',
  title: 'Project Hail Mary',
  author: 'Andy Weir &amp; O&#8217;Brien&#x2019;s &apos;Friends&apos;',
  cover: 'https://s.gr-assets.com/assets/nophoto/book/111x148.png',
})}
${update({ id: '1', title: '', author: 'Nobody' })}
</div></div><div class="bigBoxBottom"></div></div>
<a class="bookTitle" href="/book/show/92001198-een-website"><span>Greg's own book</span></a>
</body></html>`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseShelf', () => {
  it('splits the series out of the title and asks for the large cover', () => {
    expect(parseShelf(PROFILE)?.[0]).toEqual({
      title: "The Butcher's Masquerade",
      series: 'Dungeon Crawler Carl, #5',
      author: 'Matt Dinniman',
      url: 'https://www.goodreads.com/book/show/60233239',
      cover:
        'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1734202962l/60233239._SY475_.jpg',
    })
  })

  it('decodes entities and drops covers from other hosts', () => {
    expect(parseShelf(PROFILE)?.[1]).toEqual({
      title: 'Project Hail Mary',
      series: undefined,
      author: "Andy Weir & O\u2019Brien\u2019s 'Friends'",
      url: 'https://www.goodreads.com/book/show/54493401',
      cover: undefined,
    })
  })

  it('skips entries without a title and reads only the Currently Reading box', () => {
    expect(parseShelf(PROFILE)).toHaveLength(2)
    expect(
      parseShelf('<div id="currentlyReadingReviews"><div class="Updates"></div></div>'),
    ).toEqual([])
  })

  it('returns null for a page without the Currently Reading box', () => {
    expect(parseShelf('<html>Sign in</html>')).toBeNull()
  })
})

describe('getCurrentlyReading', () => {
  it('fetches and parses the profile page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(PROFILE)),
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

  it('shows no books when the profile page has changed', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>Sign in</html>')),
    )
    expect(await getCurrentlyReading()).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})
