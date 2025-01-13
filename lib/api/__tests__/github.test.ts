import {getGithubRepos} from '@/lib/api/github'
import {mockRepos} from '@/mocks'
import {describe, expect, it, vi} from 'vitest'

// Mock the fetch API.
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Github Repos', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should fetch and return the most starred GitHub repos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos)
    })

    const repos = await getGithubRepos(1)
    expect(repos).toEqual([mockRepos[0]])
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/users/gregrickaby/repos?per_page=100',
      {next: {revalidate: 3600}}
    )
  })

  it('should throw an error if no repos are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    await expect(getGithubRepos(1)).rejects.toThrow('No repos found.')
  })

  it('should throw an error if the GitHub API response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    await expect(getGithubRepos(1)).rejects.toThrow('Not Found')
  })
})
