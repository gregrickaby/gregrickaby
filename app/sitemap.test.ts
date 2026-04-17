import type {PostMeta} from '@/lib/types'

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getAllPosts: (): PostMeta[] => [
      {
        title: 'First Post',
        slug: 'first-post',
        date: '2024-06-01T00:00:00Z',
        modified: '2024-06-15T00:00:00Z',
        type: 'post'
      },
      {
        title: 'Second Post',
        slug: 'second-post',
        date: '2024-05-01T00:00:00Z',
        modified: '2024-05-10T00:00:00Z',
        type: 'post'
      }
    ]
  }
})

describe('sitemap.ts', () => {
  it('returns the correct total number of entries', async () => {
    const {default: sitemap} = await import('./sitemap')
    // home + 5 nav pages (RSS excluded) + 2 posts = 8
    expect(sitemap()).toHaveLength(8)
  })

  it('includes the home page at priority 1', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find((e) => e.url === 'https://gregrickaby.com')
    expect(entry).toMatchObject({priority: 1, changeFrequency: 'weekly'})
  })

  it('includes /about at priority 0.8', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find(
      (e) => e.url === 'https://gregrickaby.com/about'
    )
    expect(entry).toMatchObject({priority: 0.8})
  })

  it('includes /resume at priority 0.8', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find(
      (e) => e.url === 'https://gregrickaby.com/resume'
    )
    expect(entry).toMatchObject({priority: 0.8})
  })

  it('includes /contact at priority 0.6', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find(
      (e) => e.url === 'https://gregrickaby.com/contact'
    )
    expect(entry).toMatchObject({priority: 0.6})
  })

  it('includes /photos at priority 0.6', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find(
      (e) => e.url === 'https://gregrickaby.com/photos'
    )
    expect(entry).toMatchObject({priority: 0.6})
  })

  it('includes /fun-stuff at priority 0.6', async () => {
    const {default: sitemap} = await import('./sitemap')
    const entry = sitemap().find(
      (e) => e.url === 'https://gregrickaby.com/fun-stuff'
    )
    expect(entry).toMatchObject({priority: 0.6})
  })

  it('excludes the RSS feed from the sitemap', async () => {
    const {default: sitemap} = await import('./sitemap')
    const rssEntry = sitemap().find((e) => e.url.includes('feed.xml'))
    expect(rssEntry).toBeUndefined()
  })

  it('includes post entries at priority 0.7', async () => {
    const {default: sitemap} = await import('./sitemap')
    const result = sitemap()
    expect(
      result.find((e) => e.url === 'https://gregrickaby.com/first-post')
    ).toMatchObject({priority: 0.7})
    expect(
      result.find((e) => e.url === 'https://gregrickaby.com/second-post')
    ).toMatchObject({priority: 0.7})
  })
})
