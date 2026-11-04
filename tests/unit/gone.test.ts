import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getRewrittenUrl,
  isRewrite,
  unstable_doesMiddlewareMatch,
} from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { isGonePath } from '@/lib/gone'
import { redirects } from '@/lib/redirects'
import type { KnownPaths } from '@/lib/types'

/** The real content's paths, which the content build writes before the tests run. */
const paths = JSON.parse(
  readFileSync(join(process.cwd(), '.generated', 'paths.json'), 'utf-8'),
) as KnownPaths

const PAGE = '<!DOCTYPE html><html><body>Missing page</body></html>'

/** A fresh proxy, so each test starts without the cached 404 page. */
async function loadProxy() {
  vi.resetModules()
  return import('@/proxy')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('isGonePath', () => {
  it('finds removed posts, retired tags, and old WordPress routes', () => {
    for (const path of [
      '/faq',
      '/the-perfect-pan-pizza',
      '/category/photos',
      '/tag/ubuntu',
      '/tag/Ubuntu',
      '/tag/year%20in%20review',
      '/author/greg',
      '/wp-json',
      '/wp-json/wp/v2/posts',
      '/wp-admin/admin-ajax.php',
      '/2015/06',
      '/2015/06/some-old-post',
    ]) {
      expect(isGonePath(path), path).toBe(true)
    }
  })

  it('passes live pages, malformed paths, and look-alikes', () => {
    for (const path of [
      '/',
      '/about',
      '/blog',
      '/tag/photography',
      '/tag/%E0%A4%A',
      '/author/greg/extra',
      '/wp-jsonx',
      '/2015',
      '/1999/06/old',
    ]) {
      expect(isGonePath(path), path).toBe(false)
    }
  })

  it('never marks a live post, tag, or category gone', () => {
    const live = [
      ...paths.posts.map((slug) => `/${slug}`),
      ...paths.tags.map((name) => `/tag/${encodeURIComponent(name)}`),
      ...paths.categories.map((name) => `/category/${encodeURIComponent(name)}`),
    ]
    expect(live.filter(isGonePath)).toEqual([])
  })

  it('leaves every redirect target alive', () => {
    expect(redirects.filter((r) => isGonePath(r.destination)).map((r) => r.source)).toEqual([])
  })
})

describe('proxy for gone paths', () => {
  it('runs on every kind of gone path', async () => {
    const { config } = await loadProxy()
    for (const url of ['/faq', '/tag/ubuntu', '/author/greg', '/wp-json/wp/v2', '/2015/06/x']) {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(true)
    }
  })

  it('answers 410 with the 404 page, fetched once', async () => {
    const fetchMock = vi.fn(async () => new Response(PAGE, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    const { proxy } = await loadProxy()

    const first = await proxy(new NextRequest('https://gregrickaby.com/tag/ubuntu'))
    const second = await proxy(new NextRequest('https://gregrickaby.com/faq'))

    expect(first.status).toBe(410)
    expect(first.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await first.text()).toBe(PAGE)
    expect(await second.text()).toBe(PAGE)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe(
      'https://gregrickaby.com/404/missing',
    )
  })

  it('fetches the 404 page from the local port in production', async () => {
    const fetchMock = vi.fn(async () => new Response(PAGE, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PORT', '4000')
    const { proxy } = await loadProxy()
    expect((await proxy(new NextRequest('https://gregrickaby.com/faq'))).status).toBe(410)
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe(
      'http://127.0.0.1:4000/404/missing',
    )

    vi.stubEnv('PORT', '')
    delete process.env.PORT
    const again = await loadProxy()
    await again.proxy(new NextRequest('https://gregrickaby.com/faq'))
    expect(String((fetchMock.mock.calls[1] as unknown[])[0])).toBe(
      'http://127.0.0.1:3000/404/missing',
    )
  })

  it('falls back to the 404 rewrite when the page answers something else, then tries again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('challenge', { status: 403 }))
      .mockResolvedValueOnce(new Response(PAGE, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    const { proxy } = await loadProxy()

    const failed = await proxy(new NextRequest('https://gregrickaby.com/faq'))
    expect(isRewrite(failed)).toBe(true)
    expect(getRewrittenUrl(failed)).toBe('https://gregrickaby.com/404/missing')

    const retried = await proxy(new NextRequest('https://gregrickaby.com/faq'))
    expect(retried.status).toBe(410)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
