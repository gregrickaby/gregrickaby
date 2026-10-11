import { describe, expect, it, vi } from 'vitest'
import { contentIndex, photo, post, postMeta } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

vi.mock('@/.generated/content.json', () => ({ default: contentIndex() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next/form', () => ({
  default: ({ children, ...props }: React.ComponentProps<'form'>) => (
    <form {...props}>{children}</form>
  ),
}))

const { Article } = await import('@/components/article')
const { PostCard } = await import('@/components/post-card')
const { PostGrid } = await import('@/components/post-grid')
const { PostNav } = await import('@/components/post-nav')
const { PhotoGallery } = await import('@/components/photo-gallery')
const { Resume } = await import('@/components/resume')
const { SiteHeader } = await import('@/components/site-header')
const { SiteFooter } = await import('@/components/site-footer')
const { JsonLd } = await import('@/components/json-ld')
const { SearchForm } = await import('@/components/search-form')

describe('SiteHeader', () => {
  it('links home and to each section, with search and the menu', async () => {
    const html = await renderServer(<SiteHeader />)
    expect(html).toContain('href="/"')
    for (const href of ['/blog', '/contact', '/photos', '/resume']) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).toContain('href="/feed.xml"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('action="/search"')
    expect(html).toContain('popoverTarget="site-menu"')
    expect(html).toContain('aria-label="Toggle color scheme"')
  })
})

describe('SiteFooter', () => {
  it('shows the build year, license, and profiles', async () => {
    const html = await renderServer(<SiteFooter />)
    expect(html).toContain('1981-2026')
    expect(html).toContain('CC BY-NC-ND 4.0')
    expect(html).toContain('https://github.com/gregrickaby')
    expect(html).toContain('href="#top"')
  })
})

describe('SearchForm', () => {
  it('submits q to /search with a labelled input', async () => {
    const html = await renderServer(<SearchForm defaultValue="moon" id="s" />)
    expect(html).toContain('for="s"')
    expect(html).toContain('name="q"')
    expect(html).toContain('value="moon"')
  })
})

describe('Article', () => {
  it('renders a post with date, categories, hero, body, and tags', async () => {
    const html = await renderServer(<Article post={post()} />)
    expect(html).toContain('Jan 11, 2024')
    expect(html).toContain('href="/category/Blog"')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello moon')
    expect(html).toContain('href="/tag/Astrophotography"')
    expect(html).toContain('hero.jpg')
  })

  it('leaves out the reading time when it is unknown', async () => {
    const html = await renderServer(
      <Article post={post({ readingMinutes: undefined, categories: undefined })} />,
    )
    expect(html).not.toContain('min read')
    expect(html).not.toContain('/category/')
  })

  it('skips the date, hero, and tags when a page has none', async () => {
    const page = {
      ...post({ type: 'page', tags: undefined, featuredImage: undefined }),
      hero: null,
    }
    const html = await renderServer(<Article post={page} />)
    expect(html).not.toContain('<time')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('/tag/')
  })
})

describe('PostCard and PostGrid', () => {
  it('links the title and image to the post', async () => {
    const html = await renderServer(<PostCard post={postMeta()} sizes="100vw" />)
    expect(html).toContain('href="/first-post"')
    expect(html).toContain('A post about the moon.')
    expect(html).toContain('sizes="100vw"')
  })

  it('renders cards without an image or description', async () => {
    const html = await renderServer(
      <PostCard
        post={postMeta({
          featuredImage: undefined,
          description: undefined,
          readingMinutes: undefined,
        })}
        sizes="1px"
      />,
    )
    expect(html).not.toContain('<img')
    expect(html).not.toContain('A post about the moon.')
    expect(html).not.toContain('min read')
  })

  it('puts the first two posts in the featured row', async () => {
    const posts = ['a', 'b', 'c'].map((slug) => postMeta({ slug, title: slug.toUpperCase() }))
    const html = await renderServer(<PostGrid posts={posts} />)
    expect(html.match(/<article/g)).toHaveLength(3)
    expect(html).toContain('590px')
    expect(html).toContain('390px')
    expect(await renderServer(<PostGrid posts={posts.slice(0, 1)} />)).not.toContain('390px')
  })
})

describe('PostNav', () => {
  it('links to both neighbors', async () => {
    const html = await renderServer(
      <PostNav
        newer={postMeta({ slug: 'n', title: 'N' })}
        older={postMeta({ slug: 'o', title: 'O' })}
      />,
    )
    expect(html).toContain('href="/o"')
    expect(html).toContain('href="/n"')
  })

  it('handles one neighbor, and renders nothing with none', async () => {
    expect(await renderServer(<PostNav newer={null} older={postMeta({ slug: 'o' })} />)).toContain(
      'Previous',
    )
    expect(await renderServer(<PostNav newer={postMeta({ slug: 'n' })} older={null} />)).toContain(
      'Next',
    )
    expect(await renderServer(<PostNav newer={null} older={null} />)).toBe('')
  })
})

describe('PhotoGallery', () => {
  it('links each photo to its original with lightbox data', async () => {
    const html = await renderServer(
      <PhotoGallery
        photos={[
          photo(),
          photo({
            filename: 'h.jpg',
            hdr: true,
            caption: 'Dusk',
            camera: undefined,
            aperture: undefined,
            iso: undefined,
          }),
        ]}
      />,
    )
    expect(html).toContain('href="/content/photos/Moon_20240101.jpg"')
    expect(html).toContain('data-details="SONY ILCE-7RM5 · f/6.3 · ISO 100"')
    expect(html).toContain('data-full="/content/photos/h.jpg"')
    expect(html).toContain('data-caption="Moon: Dusk"')
  })
})

describe('Resume', () => {
  it('lists every job and the other experience', async () => {
    const html = await renderServer(<Resume />)
    expect(html).toContain('Mindsize')
    expect(html).toContain('href="https://mindsize.com"')
    expect(html).toContain('Other Experience')
  })
})

describe('JsonLd', () => {
  it('escapes JSON-LD so it cannot close the script tag', async () => {
    const html = await renderServer(
      <JsonLd
        graph={{
          '@context': 'https://schema.org',
          '@graph': [{ '@type': 'Thing', '@id': '</script>' }],
        }}
      />,
    )
    expect(html).not.toContain('</script><')
    expect(html).toContain('\\u003c/script\\u003e')
  })
})
