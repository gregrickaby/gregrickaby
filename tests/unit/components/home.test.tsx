import { afterEach, describe, expect, it, vi } from 'vitest'

import { contentIndex, photo, post, postMeta } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

// Tests swap parts of the content; each one starts from a fresh copy.
afterEach(() => {
  Object.assign(index, contentIndex())
})

const { HomeHero } = await import('@/components/home-hero')
const { CameraGear } = await import('@/components/camera-gear')
const { CareerStrip, CurrentlyReading, GalleryStrip, HomeAbout, LatestWriting } =
  await import('@/components/home-sections')
const { MetaLine } = await import('@/components/meta-line')
const { HOME } = await import('@/lib/site')

describe('HomeHero', () => {
  it('shows the configured photo with its EXIF, the name, and the three ways in', async () => {
    index.photos = [photo({ filename: HOME.photo, title: 'Morning Mist' })]
    const html = await renderServer(<HomeHero />)
    expect(html).toContain('<h1')
    expect(html).toContain('Greg Rickaby')
    expect(html).toContain('Morning Mist')
    expect(html).toContain('f/6.3')
    expect(html).toContain('fetchPriority="high"')
    for (const href of ['/resume', '/photos', '/blog']) expect(html).toContain(`href="${href}"`)
  })

  it('still renders the text without the photo', async () => {
    const html = await renderServer(<HomeHero />)
    expect(html).not.toContain('<img')
    expect(html).toContain('Building for the web since 1997')
  })
})

describe('HomeAbout', () => {
  it('shows only the lead beside the photo', async () => {
    const page = post(
      { slug: 'about', type: 'page' },
      '<p>Lead text</p><h2 id="more">More</h2><p>Later</p>',
    )
    const about = await renderServer(<HomeAbout page={page} />)
    expect(about).toContain('Lead text')
    expect(about).not.toContain('Later')
    expect(about).toContain('aspect-ratio:')
  })

  it('skips the photo when the page has none', async () => {
    const plain = post({ slug: 'about', type: 'page', featuredImage: undefined }, '')
    expect(await renderServer(<HomeAbout page={plain} />)).not.toContain('<img')
  })
})

describe('CameraGear', () => {
  it('puts the gear beside the rig photo and the disclaimer below', async () => {
    const page = post(
      { slug: 'gear', type: 'page' },
      '<p><strong>Kit:</strong></p><ul><li>Camera</li></ul><h2 id="affiliate-disclaimer">Affiliate disclaimer</h2><p>Small print</p>',
    )
    const html = await renderServer(<CameraGear page={page} />)
    expect(html).toMatch(/Kit:[\s\S]*Camera[\s\S]*role="note"[\s\S]*Small print/)
  })

  it('leaves out the note without a disclaimer section', async () => {
    const page = post({ slug: 'gear', type: 'page' }, '<ul><li>Camera</li></ul>')
    expect(await renderServer(<CameraGear page={page} />)).not.toContain('role="note"')
  })
})

describe('strips', () => {
  it('lists every role, newest first', async () => {
    const html = await renderServer(<CareerStrip />)
    expect(html).toContain('Mindsize')
    expect(html.indexOf('Mindsize')).toBeLessThan(html.indexOf('WebDevStudios'))
    expect(html).toContain('href="/resume"')
  })

  it('shows the latest posts and recent photos', async () => {
    expect(await renderServer(<LatestWriting posts={[postMeta()]} />)).toContain('First Post')
    const html = await renderServer(
      <GalleryStrip
        photos={[
          photo(),
          photo({ filename: 'x.jpg', camera: undefined, aperture: undefined, iso: undefined }),
        ]}
      />,
    )
    expect(html).toContain('data-lightbox')
    expect(html).toContain('data-details="SONY ILCE-7RM5')
    expect(html).toContain('sizes="(max-width: 640px) 330px, 420px"')
    expect(html).toMatch(/aspect-ratio:\d+ \/ \d+/)
  })
})

describe('MetaLine', () => {
  it('joins items with dots and skips empty ones', async () => {
    const html = (
      await renderServer(<MetaLine items={['a', null, undefined, '', 'b']} />)
    ).replaceAll('<!-- -->', '')
    expect(html).toContain('a<span aria-hidden="true"> · </span>b')
  })
})

describe('CurrentlyReading', () => {
  it('lists each book with its cover, series, and author, linking to Goodreads', async () => {
    const html = await renderServer(
      <CurrentlyReading
        books={[
          {
            title: 'All These Worlds',
            series: 'Bobiverse, #3',
            author: 'Dennis E. Taylor',
            url: 'https://www.goodreads.com/book/show/1',
            cover: 'https://i.gr-assets.com/images/S/1._SY475_.jpg',
          },
          { title: 'No Cover', author: 'Someone', url: 'https://www.goodreads.com/book/show/2' },
        ]}
      />,
    )
    expect(html).toContain('On my nightstand')
    expect(html).toContain('href="https://www.goodreads.com/book/show/1"')
    expect(html).toContain('Bobiverse, #3')
    expect(html).toContain('Dennis E. Taylor')
    expect(html.match(/<img/g)).toHaveLength(1)
    expect(html).toContain('href="https://www.goodreads.com/gregrickaby"')
  })

  it('renders nothing when the shelf is empty', async () => {
    expect(await renderServer(<CurrentlyReading books={[]} />)).toBe('')
  })
})
