// vi.hoisted() ensures mocks are initialised before vi.mock() factories run,
// which in turn are hoisted above the static import of the route module.
const {mockJson} = vi.hoisted(() => ({
  mockJson: vi.fn()
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}))

import {GET} from './route'

describe('GET /api/healthcheck', () => {
  beforeEach(() => {
    mockJson.mockClear()
  })

  it('calls NextResponse.json once per request', async () => {
    await GET()
    expect(mockJson).toHaveBeenCalledOnce()
  })

  it('returns status "ok" in the response body', async () => {
    await GET()
    const [body] = mockJson.mock.calls[0] as [Record<string, unknown>]
    expect(body.status).toBe('ok')
  })

  it('returns the correct service name in the response body', async () => {
    await GET()
    const [body] = mockJson.mock.calls[0] as [Record<string, unknown>]
    expect(body.service).toBe('gregrickaby.com')
  })

  it('returns a valid ISO 8601 timestamp in the response body', async () => {
    await GET()
    const [body] = mockJson.mock.calls[0] as [Record<string, unknown>]
    const ts = body.timestamp as string
    expect(new Date(ts).toISOString()).toBe(ts)
  })

  it('passes HTTP status 200 in the options', async () => {
    await GET()
    const [, options] = mockJson.mock.calls[0] as [unknown, {status: number}]
    expect(options.status).toBe(200)
  })

  it('sets Cache-Control to no-store in the response headers', async () => {
    await GET()
    const [, options] = mockJson.mock.calls[0] as [
      unknown,
      {headers: Record<string, string>}
    ]
    expect(options.headers['Cache-Control']).toBe(
      'no-store, no-cache, must-revalidate'
    )
  })

  it('sets Content-Type to application/json in the response headers', async () => {
    await GET()
    const [, options] = mockJson.mock.calls[0] as [
      unknown,
      {headers: Record<string, string>}
    ]
    expect(options.headers['Content-Type']).toBe('application/json')
  })
})
