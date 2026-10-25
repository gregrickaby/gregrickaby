import { afterEach, describe, expect, it, vi } from 'vitest'

import type { headers as Headers } from '@/lib/headers'

describe('headers', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalEnv ?? 'test')
    vi.resetModules()
  })

  function getCspValue(headers: typeof Headers) {
    return headers[0]!.headers.find((h) => h.key === 'Content-Security-Policy')?.value
  }

  it("includes 'unsafe-eval' in development", async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    expect(getCspValue(headers)).toContain("'unsafe-eval'")
  })

  it("excludes 'unsafe-eval' in production", async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    expect(getCspValue(headers)).not.toContain("'unsafe-eval'")
  })

  it('points every path at llms.txt', async () => {
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    expect(headers[0]!.source).toBe('/:path*')
    expect(headers[0]!.headers).toContainEqual({
      key: 'Link',
      value: '</llms.txt>; rel="describedby"',
    })
  })

  it('repeats the robots.txt content signals on every response', async () => {
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    expect(headers[0]!.headers).toContainEqual({
      key: 'Content-Signal',
      value: 'search=yes, ai-input=yes, ai-train=no',
    })
  })

  it('sets long-lived caching on static asset paths', async () => {
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    const assetRule = headers[1]
    expect(assetRule!.headers[0]).toEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    })
  })

  it('sends the security headers the edge transform also writes', async () => {
    vi.resetModules()
    const { headers } = await import('@/lib/headers')
    expect(headers[0]!.headers).toEqual(
      expect.arrayContaining([
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
      ]),
    )
  })
})
