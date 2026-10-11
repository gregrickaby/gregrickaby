import type { ResolvingMetadata } from 'next'
import { describe, expect, it, vi } from 'vitest'
import { contentIndex } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

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
vi.mock('@/app/actions/contact', () => ({ sendContactEmail: vi.fn() }))
vi.mock('next/server', () => ({ connection: vi.fn(async () => {}) }))

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
const notFoundPage = await import('@/app/not-found')
const sitemap = await import('@/app/sitemap')
const robots = await import('@/app/robots')
const feed = await import('@/app/feed.xml/route')
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
  it('requires every page to prerender and passes children through', () => {
    expect(staticLayout.ensureStatic).toBe('navigation')
    expect(staticLayout.default({ children: 'x' })).toBe('x')
  })
})

describe('home', () => {
  it('shows the About page with its metadata', async () => {
    expect(await renderServer(<home.default />)).toContain('Hello there')
    expect(await home.generateMetadata({}, parent)).toMatchObject({
      title: 'About',
      alternates: { canonical: '/' },
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
    expect(blog.metadata.alternates?.canonical).toBe('/blog')
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
    expect(await mod.generateMetadata(props(name))).toMatchObject({
      title: metaTitle,
      alternates: { canonical: `/${kind}/${name}` },
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
  })

  it('says so when there are no photos', async () => {
    const saved = index.photos
    index.photos = []
    expect(await renderServer(<photos.default />)).toContain('No photos yet.')
    index.photos = saved
  })

  it('renders the resume and contact pages with metadata', async () => {
    expect(await renderServer(<resume.default />)).toContain('Mindsize')
    expect(await resume.generateMetadata({}, parent)).toMatchObject({ title: 'Resume' })
    const html = await renderServer(<contact.default />)
    expect(html).toContain('Send Message')
    expect(html).toContain('WebPage')
    expect(await contact.generateMetadata({}, parent)).toMatchObject({ title: 'Contact' })
  })

  it('falls back to the site description for a page without one', async () => {
    const resumePage = index.pages[1]!
    const saved = resumePage.meta.description
    resumePage.meta.description = undefined
    expect(await renderServer(<resume.default />)).toContain('Alabama-based software engineer')
    resumePage.meta.description = saved
  })

  it('is a 404 when a page file is missing', async () => {
    const saved = index.pages
    index.pages = []
    for (const Page of [home.default, resume.default, contact.default]) {
      await expect(renderServer(<Page />)).rejects.toBeInstanceOf(NotFound)
    }
    expect(await home.generateMetadata({}, parent)).toEqual({})
    expect(await resume.generateMetadata({}, parent)).toEqual({})
    expect(await contact.generateMetadata({}, parent)).toEqual({})
    index.pages = saved
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

  it('keeps search out of the index', () => {
    expect(robots.default()).toMatchObject({
      rules: { disallow: '/search' },
      sitemap: 'https://gregrickaby.com/sitemap.xml',
    })
  })

  it('serves RSS', async () => {
    const res = feed.GET()
    expect(res.headers.get('Content-Type')).toContain('application/rss+xml')
    const xml = await res.text()
    expect(xml).toContain('<link>https://gregrickaby.com/newest</link>')
    expect(xml).toContain('Sun, 11 Oct 2026')
  })

  it('answers the health check without caching', async () => {
    const res = await health.GET()
    expect(await res.json()).toEqual({ status: 'ok' })
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
})
