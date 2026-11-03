import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

import {
  checkBasics,
  checkCrawlers,
  checkHop,
  checkLlms,
  checkRedirects,
  checkRobots,
  getBlockedAgents,
} from './site.ts'

const BASE = 'https://gregrickaby.com'
const realFetch = globalThis.fetch

/** Answers each URL from a table; an unknown URL answers 404. */
function serve(answers: Record<string, () => Response>) {
  const fetchMock = mock.fn(async (url: string) => {
    const key = url.startsWith(`${BASE}/seo-audit-`) ? 'missing' : url
    return answers[key]?.() ?? new Response(null, { status: 404 })
  })
  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

function redirect(location: string, status = 308) {
  return () => new Response(null, { status, headers: { location } })
}

const SECURE = {
  'strict-transport-security': 'max-age=63072000',
  'content-security-policy': "default-src 'self'",
  'x-content-type-options': 'nosniff',
  'content-encoding': 'br',
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('checkHop', () => {
  it('passes a permanent one-hop redirect, absolute or relative', async () => {
    serve({ 'http://gregrickaby.com/blog': redirect(`${BASE}/blog`, 301), [`${BASE}/feed`]: redirect('/feed.xml') })

    assert.equal(await checkHop('http://gregrickaby.com/blog', `${BASE}/blog`), null)
    assert.equal(await checkHop(`${BASE}/feed`, `${BASE}/feed.xml`), null)
  })

  it('reports a temporary redirect, a non-redirect, or the wrong target', async () => {
    serve({
      [`${BASE}/temp`]: redirect('/x', 302),
      [`${BASE}/wrong`]: redirect('/elsewhere'),
    })

    assert.equal(await checkHop(`${BASE}/temp`, `${BASE}/x`), `${BASE}/temp answers 302, not a 301 or 308`)
    assert.equal(await checkHop(`${BASE}/none`, `${BASE}/x`), `${BASE}/none answers 404, not a 301 or 308`)
    assert.equal(
      await checkHop(`${BASE}/wrong`, `${BASE}/x`),
      `${BASE}/wrong redirects to ${BASE}/elsewhere, not ${BASE}/x`,
    )
  })
})

describe('checkBasics', () => {
  it('passes a site with its headers and a real 404', async () => {
    serve({ [BASE]: () => new Response('ok', { headers: SECURE }) })

    assert.deepEqual(await checkBasics(BASE), [])
  })

  it('lists each missing header and a soft 404', async () => {
    serve({ [BASE]: () => new Response('ok'), missing: () => new Response('home', { status: 200 }) })

    assert.deepEqual(await checkBasics(BASE), [
      'home page sends no strict-transport-security',
      'home page sends no content-security-policy',
      'home page sends no x-content-type-options',
      'home page is not compressed',
      'a missing page answers 200, not 404',
    ])
  })
})

describe('getBlockedAgents', () => {
  it('reads named groups first, then falls back to *', () => {
    const rules = [
      '# comment',
      'User-Agent: GPTBot',
      'User-Agent: ClaudeBot',
      'Disallow: /',
      '',
      'User-Agent: Googlebot',
      'Disallow: /private',
      '',
      'User-Agent: *',
      'Allow: /',
    ].join('\n')

    assert.deepEqual(getBlockedAgents(rules), ['GPTBot', 'ClaudeBot'])
    assert.equal(getBlockedAgents('User-Agent: *\nDisallow: /').length, 9)
    assert.deepEqual(getBlockedAgents('Disallow: /\nSitemap: https://x'), [])
  })
})

describe('checkRobots', () => {
  it('passes a robots.txt with a sitemap and content signal that blocks no one', async () => {
    serve({
      [`${BASE}/robots.txt`]: () =>
        new Response('User-Agent: *\nContent-Signal: search=yes\nAllow: /\nSitemap: https://gregrickaby.com/sitemap.xml'),
    })

    assert.deepEqual(await checkRobots(BASE), [])
  })

  it('reports a missing sitemap line, content signal, and blocked agents', async () => {
    serve({ [`${BASE}/robots.txt`]: () => new Response('User-Agent: PerplexityBot\nDisallow: /') })

    assert.deepEqual(await checkRobots(BASE), [
      'robots.txt does not name the sitemap',
      'robots.txt states no Content-Signal',
      'robots.txt blocks PerplexityBot',
    ])
  })

  it('reports a missing robots.txt', async () => {
    serve({})

    assert.deepEqual(await checkRobots(BASE), ['robots.txt answers 404'])
  })
})

describe('checkCrawlers', () => {
  it('reports each crawler the edge turns away', async () => {
    const fetchMock = mock.fn(async (_url: string, init: RequestInit) => {
      const agent = (init.headers as Record<string, string>)['user-agent'] ?? ''
      return new Response(null, { status: agent.includes('GPTBot') ? 403 : 200 })
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    assert.deepEqual(await checkCrawlers(BASE), [`GPTBot gets 403 from ${BASE}`])
    assert.equal(fetchMock.mock.callCount(), 6)
  })
})

describe('checkLlms', () => {
  it('reports Markdown copies that fail or answer as another type', async () => {
    serve({
      [`${BASE}/llms.txt`]: () =>
        new Response(`- [A](${BASE}/a.md): one\n- [B](${BASE}/b.md): two\n- [C](${BASE}/c.md): three`),
      [`${BASE}/a.md`]: () => new Response(null, { headers: { 'content-type': 'text/markdown; charset=utf-8' } }),
      [`${BASE}/b.md`]: () => new Response(null, { headers: { 'content-type': 'text/html' } }),
    })

    assert.deepEqual(await checkLlms(BASE), [
      `llms.txt lists ${BASE}/b.md, which answers 200 text/html`,
      `llms.txt lists ${BASE}/c.md, which answers 404 `,
    ])
  })

  it('reports a missing llms.txt', async () => {
    serve({})

    assert.deepEqual(await checkLlms(BASE), ['llms.txt answers 404'])
  })
})

describe('checkRedirects', () => {
  it('follows fixed redirects to a live page, and skips patterns', async () => {
    const fetchMock = serve({
      [`${BASE}/feed`]: redirect('/feed.xml'),
      [`${BASE}/feed.xml`]: () => new Response('<rss/>'),
      [`${BASE}/old`]: redirect('/gone'),
      [`${BASE}/blog/feed/`]: redirect('/blog/feed'),
    })
    const rules = [
      { source: '/feed', destination: '/feed.xml' },
      { source: '/old', destination: '/gone' },
      { source: '/blog/feed/', destination: '/feed.xml' },
      { source: '/page/:num', destination: '/blog' },
    ]

    assert.deepEqual(await checkRedirects(BASE, rules), [
      '/old lands on /gone, which answers 404',
      `${BASE}/blog/feed/ redirects to ${BASE}/blog/feed, not ${BASE}/feed.xml`,
    ])
    assert.equal(fetchMock.mock.callCount(), 5)
  })
})
