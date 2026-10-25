import type { ResolvingMetadata } from 'next'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))
vi.mock('@/.generated/markdown.json', () => ({
  default: { newest: '# Newest Post\n', middle: '# Middle Post\n' },
}))

// Tests swap parts of the content; each one starts from a fresh copy.
afterEach(() => {
  Object.assign(index, contentIndex())
})

class NotFound extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFound()
  },
  usePathname: () => '/',
}))
vi.mock('next/form', () => ({
  default: ({ children, ...props }: React.ComponentProps<'form'>) => (
    <form {...props}>{children}</form>
  ),
}))
vi.mock('next/server', () => ({ connection: vi.fn(async () => {}) }))
vi.mock('@/lib/goodreads', () => ({
  getCurrentlyReading: async () => [
    { title: 'All These Worlds', author: 'Dennis E. Taylor', url: 'https://example.com/book' },
  ],
}))

const parent = Promise.resolve({ openGraph: { images: [] } }) as unknown as ResolvingMetadata
const params = <T,>(value: T) => Promise.resolve(value)

const home = await import('@/app/(site)/page')
const postPage = await import('@/app/(site)/[slug]/page')
const blog = await import('@/app/(site)/blog/page')
const category = await import('@/app/(site)/category/[category]/page')
const tag = await import('@/app/(site)/tag/[tag]/page')
const photos = await import('@/app/(site)/photos/page')
const resume = await import('@/app/(site)/resume/page')
const contact = await import('@/app/(site)/contact/page')
const search = await import('@/app/search/page')
const staticLayout = await import('@/app/(site)/layout')
const searchLayout = await import('@/app/search/layout')
const notFoundPage = await import('@/app/not-found')
const siteNotFound = await import('@/app/(site)/not-found')
const sitemap = await import('@/app/sitemap')
const robots = await import('@/app/robots.txt/route')
const feed = await import('@/app/feed.xml/route')
const markdownRoute = await import('@/app/md/[slug]/route')
const llms = await import('@/app/llms.txt/route')
const resumeMarkdown = await import('@/app/resume.md/route')
const photosMarkdown = await import('@/app/photos.md/route')
const photosJson = await import('@/app/photos.json/route')
const health = await import('@/app/api/health/route')

// Typed-route PageProps want both params and searchParams; tests pass only what a page reads.
const PostPage = postPage.default as unknown as (
  props: Record<string, unknown>,
) => React.ReactElement
const SearchPage = search.default as unknown as (
  props: Record<string, unknown>,
) => React.ReactElement

describe('param routes', () => {
  it('block on params so the HTML holds the content', () => {
    expect([postPage.instant, category.instant, tag.instant]).toEqual([false, false, false])
  })
})

describe('static route group', () => {
  it('requires every page to prerender and wraps it in the site header and footer', async () => {
    expect(staticLayout.ensureStatic).toBe('navigation')
    const html = await renderServer(<staticLayout.default>Page body</staticLayout.default>)
    expect(html).toContain('href="#main"')
    expect(html).toContain('<main')
    expect(html).toContain('Page body')
  })

  it('gives search the same header and footer', async () => {
    const html = await renderServer(<searchLayout.default>Results</searchLayout.default>)
    expect(html).toContain('href="#main"')
    expect(html).toContain('Results')
  })
})

describe('home', () => {
  it('shows the About page and the shelf, titled as the home page, not About', async () => {
    const html = await renderServer(<home.default />)
    expect(html).toContain('Hello there')
    expect(html).toContain('All These Worlds')
    expect(await home.generateMetadata({}, parent)).toMatchObject({
      title: { absolute: 'Greg Rickaby - Software engineer, photographer, and author' },
      alternates: { canonical: '/' },
      openGraph: { title: 'Greg Rickaby', url: 'https://gregrickaby.com', type: 'website' },
    })
  })
})

describe('post page', () => {
  it('prerenders every post', () => {
    expect(postPage.generateStaticParams()).toEqual([
      { slug: 'newest' },
      { slug: 'middle' },
      { slug: 'oldest' },
    ])
  })

  it('renders the post, its neighbors, and JSON-LD', async () => {
    const html = await renderServer(<PostPage params={params({ slug: 'middle' })} />)
    expect(html).toContain('Middle Post')
    expect(html).toContain('href="/newest"')
    expect(html).toContain('href="/oldest"')
    expect(html).toContain('BlogPosting')
    expect(html).toContain('Like this post')
  })

  it('builds metadata, and none for an unknown post', async () => {
    expect(
      await postPage.generateMetadata({ params: params({ slug: 'newest' }) } as never, parent),
    ).toMatchObject({ title: 'Newest Post', alternates: { canonical: '/newest' } })
    expect(
      await postPage.generateMetadata({ params: params({ slug: 'nope' }) } as never, parent),
    ).toEqual({})
  })

  it('is a 404 for an unknown post', async () => {
    await expect(
      renderServer(<PostPage params={params({ slug: 'nope' })} />),
    ).rejects.toBeInstanceOf(NotFound)
  })
})

describe('blog', () => {
  it('lists every post', async () => {
    const html = await renderServer(<blog.default />)
    expect(html).toContain('Newest Post')
    expect(html).toContain('Oldest Post')
    expect(await blog.generateMetadata({}, parent)).toMatchObject({
      alternates: { canonical: '/blog' },
      openGraph: { title: 'Blog', url: 'https://gregrickaby.com/blog', siteName: 'Greg Rickaby' },
    })
  })
})

describe.each([
  ['category', category, 'Code', 'Middle Post', 'Posts in "Code"'],
  ['tag', tag, 'Moon', 'Newest Post', 'Posts tagged "Moon"'],
] as const)('%s page', (kind, mod, name, title, metaTitle) => {
  const props = (value: string) => ({ params: params({ [kind]: value }) }) as never

  it('prerenders every name, encoded', () => {
    expect(mod.generateStaticParams()).toContainEqual({ [kind]: name })
  })

  it('lists matching posts', async () => {
    const Page = mod.default as unknown as (p: object) => React.ReactElement
    const html = await renderServer(<Page {...(props(encodeURIComponent(name)) as object)} />)
    expect(html).toContain(title)
    expect(await mod.generateMetadata(props(name), parent)).toMatchObject({
      title: metaTitle,
      alternates: { canonical: `/${kind}/${name}` },
      openGraph: { title: metaTitle, url: `https://gregrickaby.com/${kind}/${name}` },
    })
  })

  it('is a 404 with no posts', async () => {
    const Page = mod.default as unknown as (p: object) => React.ReactElement
    await expect(renderServer(<Page {...(props('nothing') as object)} />)).rejects.toBeInstanceOf(
      NotFound,
    )
  })
})

describe('photos, resume, and contact', () => {
  it('renders the gallery', async () => {
    const html = await renderServer(<photos.default />)
    expect(html).toContain('/content/photos/Castle.jpg')
    expect(photos.metadata.title).toBe('Photos')
    expect(photos.metadata.alternates?.types).toEqual({ 'text/markdown': '/photos.md' })
  })

  it('says so when there are no photos', async () => {
    index.photos = []
    expect(await renderServer(<photos.default />)).toContain('No photos yet.')
  })

  it('renders the resume and contact pages with metadata', async () => {
    expect(await renderServer(<resume.default />)).toContain('Mindsize')
    expect(await resume.generateMetadata({}, parent)).toMatchObject({
      title: 'Resume',
      alternates: { types: { 'text/markdown': '/resume.md' } },
    })
    const html = await renderServer(<contact.default />)
    expect(html).toContain('href="mailto:greg@gregrickaby.com"')
    expect(html).toContain('WebPage')
    expect(await contact.generateMetadata({}, parent)).toMatchObject({ title: 'Contact' })
  })

  it('falls back to the site description for a page without one', async () => {
    index.pages[1]!.meta.description = undefined
    expect(await renderServer(<resume.default />)).toContain('Alabama-based software engineer')
  })

  it('is a 404 when a page file is missing', async () => {
    index.pages = []
    for (const Page of [home.default, resume.default, contact.default]) {
      await expect(renderServer(<Page />)).rejects.toBeInstanceOf(NotFound)
    }
    expect(await resume.generateMetadata({}, parent)).toEqual({})
    expect(await contact.generateMetadata({}, parent)).toEqual({})
  })
})

describe('search', () => {
  const render = async (q?: string | string[]) =>
    (
      await renderServer(<SearchPage searchParams={params(q === undefined ? {} : { q })} />)
    ).replaceAll('<!-- -->', '')

  it('shows only the form without a query', async () => {
    const html = await render()
    expect(html).toContain('name="q"')
    expect(html).not.toContain('role="status"')
    expect(search.metadata.robots).toMatchObject({ index: false })
  })

  it('counts matches', async () => {
    expect(await render('moon')).toContain('1 post matches')
    expect(await render(['post', 'ignored'])).toContain('3 posts match')
    expect(await render('zebra')).toContain('No posts match')
  })
})

describe('not found', () => {
  it('links home and to search', async () => {
    const html = await renderServer(<notFoundPage.default />)
    expect(html).toContain('404')
    expect(html).toContain('href="/search"')
    expect(html).toContain('href="#main"')
  })

  it('has a tape deck that says it needs JavaScript', async () => {
    const html = await renderServer(<notFoundPage.default />)
    expect(html).toContain('404 blues')
    expect(html).toContain('Turn on JavaScript to play the tapes.')
  })

  it('leaves the shell to the (site) layout for a missing post', async () => {
    const html = await renderServer(<siteNotFound.default />)
    expect(html).toContain('404')
    expect(html).not.toContain('href="#main"')
  })
})

describe('sitemap, robots, feed, health', () => {
  it('lists the home page, sections, and posts', () => {
    const urls = sitemap.default().map((e) => e.url)
    expect(urls[0]).toBe('https://gregrickaby.com')
    expect(urls).toContain('https://gregrickaby.com/blog')
    expect(urls).toContain('https://gregrickaby.com/middle')
    expect(urls).not.toContain('https://gregrickaby.com/feed.xml')
  })

  it('keeps search out of the index and signals AI use', async () => {
    const res = robots.GET()
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    const text = await res.text()
    expect(text).toContain('Disallow: /search')
    expect(text).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=no')
  })

  it('serves RSS', async () => {
    const res = feed.GET()
    expect(res.headers.get('Content-Type')).toContain('application/rss+xml')
    const xml = await res.text()
    expect(xml).toContain('<link>https://gregrickaby.com/newest</link>')
    expect(xml).toContain('Sun, 11 Oct 2026')
  })

  it('serves llms.txt as Markdown, linking each post', async () => {
    const res = llms.GET()
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    const text = await res.text()
    expect(text).toMatch(/^# Greg Rickaby\n/)
    expect(text).toContain('](https://gregrickaby.com/newest.md)')
  })

  it('serves the resume and photos as Markdown', async () => {
    for (const route of [resumeMarkdown, photosMarkdown]) {
      expect(route.GET().headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    }
    expect(await resumeMarkdown.GET().text()).toContain('### Technical Lead, [Mindsize]')
    expect(await photosMarkdown.GET().text()).toContain('## Castle')
  })

  it('prerenders a Markdown copy of each post', () => {
    expect(markdownRoute.generateStaticParams()).toEqual([{ slug: 'newest' }, { slug: 'middle' }])
  })

  it("serves a post's Markdown, and a 404 for an unknown slug", async () => {
    const context = (slug: string) => ({ params: params({ slug }) }) as never
    const res = await markdownRoute.GET(new Request('https://gregrickaby.com'), context('middle'))
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(await res.text()).toBe('# Middle Post\n')

    const missing = await markdownRoute.GET(
      new Request('https://gregrickaby.com'),
      context('constructor'),
    )
    expect(missing.status).toBe(404)
  })

  it('answers the health check without caching', async () => {
    const res = await health.GET()
    expect(await res.json()).toEqual({ status: 'ok' })
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('serves the photo list as JSON with absolute image urls', async () => {
    const res = photosJson.GET()
    expect(res.headers.get('Content-Type')).toContain('application/json')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600')
    const body = await res.json()
    expect(typeof body.generatedAt).toBe('string')
    expect(body.count).toBe(2)
    expect(body.photos[1]).toMatchObject({
      filename: 'Castle.jpg',
      title: 'Castle',
      url: 'https://gregrickaby.com/content/photos/Castle.jpg',
      hdr: true,
    })
  })

  it('percent-encodes image paths that contain spaces', async () => {
    index.photos = [
      {
        ...index.photos[0]!,
        filename: 'Modern Cleaners.jpg',
        src: '/content/photos/Modern Cleaners.jpg',
      },
    ]
    const body = await photosJson.GET().json()
    expect(body.photos[0].url).toBe('https://gregrickaby.com/content/photos/Modern%20Cleaners.jpg')
  })
})
