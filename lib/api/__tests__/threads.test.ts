import {getThreads} from '@/lib/api/threads'
import {mockThreads} from '@/mocks/mockThreads'
import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from 'vitest'

/**
 * Mock the server response.
 */
const server = setupServer(
  http.get('https://graph.threads.net/v1.0/me/threads', () => {
    return HttpResponse.json(mockThreads)
  })
)

describe('getThreads', () => {
  beforeAll(() => server.listen())
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should fetch threads successfully', async () => {
    const data = await getThreads(5)

    expect(data).toBeDefined()
    expect(data.data).toHaveLength(5)
    expect(data.data[0].id).toBe('18041823712779396')
    expect(data.data[0].text).toBe(
      'Taking advantage of the new moon! Milky Way from my front yard'
    )
  })

  it('should throw an error if the response is not ok', async () => {
    server.use(
      http.get('https://graph.threads.net/v1.0/me/threads', () => {
        return HttpResponse.json(
          {error: 'Internal Server Error'},
          {status: 500}
        )
      })
    )

    await expect(getThreads(5)).rejects.toThrow(
      'Error fetching threads: Internal Server Error'
    )
  })

  it('should throw an error if there is no data', async () => {
    server.use(
      http.get('https://graph.threads.net/v1.0/me/threads', () => {
        return HttpResponse.json({data: []})
      })
    )

    await expect(getThreads(5)).rejects.toThrow('No data returned')
  })

  it('should throw an error if the access token is missing', async () => {
    process.env.THREADS_ACCESS_TOKEN = ''

    await expect(getThreads(5)).rejects.toThrow(
      'Access token is not set in environment variables!'
    )
  })
})
