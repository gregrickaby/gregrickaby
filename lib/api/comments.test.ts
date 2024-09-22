import {mockComments} from '@/lib/mocks'
import {vi} from 'vitest'
import {createComment, fetchComments} from './comments'

// Mock the fetch API.
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchComments', () => {
  const mockFetchSuccess = (data = mockComments) => {
    ;(global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    })
  }

  const mockFetchError = (message = 'Failed to fetch comments') => {
    ;(global.fetch as vi.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({})
    })
  }

  it('should fetch comments successfully', async () => {
    mockFetchSuccess()

    const comments = await fetchComments(1)
    expect(comments).toEqual(mockComments)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('comments'),
      expect.objectContaining({
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })
    )
  })

  it('should throw an error when no post ID is provided', async () => {
    await expect(fetchComments(0)).rejects.toThrow('No post ID provided')
  })

  it('should throw an error when the server response is not OK', async () => {
    mockFetchError()

    await expect(fetchComments(1)).rejects.toThrow('Failed to fetch comments')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should throw an error when the response is not an array', async () => {
    // Mock response with invalid data format
    mockFetchSuccess({}) // Invalid response, expecting array

    await expect(fetchComments(1)).rejects.toThrow(
      'Unexpected response format for comments'
    )
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should log an error and throw an exception if fetch throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error') // We already mock this in beforeEach

    // Mock fetch to throw an error
    ;(global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'))

    await expect(fetchComments(1)).rejects.toThrow('Network error')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Exception thrown in fetchComments(): Error: Network error'
      )
    )
  })
})

describe('createComment', () => {
  it('should create a comment successfully', async () => {
    const mockResponse = {
      id: 1,
      post: 123,
      content: {rendered: 'Test comment'},
      author_name: 'John Doe',
      status: 'approved'
    }

    // Mock the fetch API call.
    ;(global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await createComment({
      postId: 123,
      comment: 'Test comment',
      authorName: 'John Doe',
      authorEmail: 'john.doe@example.com'
    })

    expect(result).toEqual(
      'Your comment has been successfully submitted and is now live. Thank you!'
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/comments'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })

  it('should throw an error when the API call fails', async () => {
    ;(global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    await expect(
      createComment({
        postId: 123,
        comment: 'Test comment',
        authorName: 'John Doe',
        authorEmail: ''
      })
    ).rejects.toThrow('Missing required parameters')
  })
})
