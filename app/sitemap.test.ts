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
  it('returns sitemap entries for all posts plus static pages', async () => {
    const {default: sitemap} = await import('./sitemap')
    const result = sitemap()

    // Should have home + about + resume + contact + fun-stuff + 2 posts = 7 entries
    expect(result).toHaveLength(7)

    // First entry is the home page
    expect(result[0]).toMatchObject({
      url: 'https://gregrickaby.com',
      priority: 1
    })

    // Second entry is the about page
    expect(result[1]).toMatchObject({
      url: 'https://gregrickaby.com/about',
      priority: 0.8
    })

    // Third entry is the resume page
    expect(result[2]).toMatchObject({
      url: 'https://gregrickaby.com/resume',
      priority: 0.8
    })

    // Fourth entry is the contact page
    expect(result[3]).toMatchObject({
      url: 'https://gregrickaby.com/contact',
      priority: 0.6
    })

    // Fifth entry is the fun-stuff page
    expect(result[4]).toMatchObject({
      url: 'https://gregrickaby.com/fun-stuff',
      priority: 0.6
    })

    // Post entries
    expect(result[5]).toMatchObject({
      url: 'https://gregrickaby.com/first-post',
      priority: 0.7
    })
    expect(result[6]).toMatchObject({
      url: 'https://gregrickaby.com/second-post',
      priority: 0.7
    })
  })
})
