import {getPageBySlug, getPages, getPostBySlug, getPosts} from '@/lib/api'
import {mockPost} from '@/lib/mocks'
import {describe, expect, it, vi} from 'vitest'

// Mock the fetch API.
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('WordPress API Functions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should fetch and return pages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockPost])
    })

    const pages = await getPages(1)
    expect(pages).toEqual([mockPost])
  })

  it('should fetch and return posts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockPost])
    })

    const posts = await getPosts(1)
    expect(posts).toEqual([mockPost])
  })

  it('should fetch and return a page by slug', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockPost])
    })

    const page = await getPageBySlug('sienna-by-starlight')
    expect(page).toEqual(mockPost)
  })

  it('should fetch and return a post by slug', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockPost])
    })

    const post = await getPostBySlug('sienna-by-starlight')
    expect(post).toEqual(mockPost)
  })

  it('should throw an error if no data is found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    await expect(getPages(1)).rejects.toThrow('No data found')
  })

  it('should throw an error if the network response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false
    })

    await expect(getPages(1)).rejects.toThrow('Network response was not ok')
  })
})
