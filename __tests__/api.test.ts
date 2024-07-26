import {mockPost, mockRepos} from '@/__tests__/__mocks__/'
import {
  getPageBySlug,
  getPages,
  getPopularGithubRepos,
  getPostBySlug,
  getPosts
} from '@/lib/api'
import {describe, expect, it, vi} from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

afterEach(() => {
  mockFetch.mockClear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('WordPress API Functions', () => {
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

describe('Github Repos', () => {
  it('should fetch and return the most starred GitHub repos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos)
    })

    const repos = await getPopularGithubRepos(1)
    expect(repos).toEqual([mockRepos[0]])
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/users/gregrickaby/repos?per_page=100'
    )
  })

  it('should throw an error if no repos are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    await expect(getPopularGithubRepos(1)).rejects.toThrow('No repos found.')
  })

  it('should throw an error if the GitHub API response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    await expect(getPopularGithubRepos(1)).rejects.toThrow('Not Found')
  })
})
