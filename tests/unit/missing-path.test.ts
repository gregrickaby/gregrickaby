import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  getRewrittenUrl,
  isRewrite,
  unstable_doesMiddlewareMatch,
} from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { isMissingPath } from '@/lib/missing-path'
import { config, proxy } from '@/proxy'

vi.mock('@/.generated/paths.json', () => ({
  default: { posts: ['hello-world'], tags: ['hdr', 'café'], categories: ['code'] },
}))

/** Folders under `dir` with a page or route handler below them and no dynamic segment between. */
function routeFolders(dir: string): string[] {
  const root = join(process.cwd(), dir)
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[([_]/.test(entry.name))
    .map((entry) => entry.name)
    .filter((name) =>
      readdirSync(join(root, name), { recursive: true }).some((file) =>
        /^[^[]*(^|\/)(page|route)\.tsx?$/.test(String(file)),
      ),
    )
}

describe('isMissingPath', () => {
  it('finds posts, tags, and categories that have no page', () => {
    expect(isMissingPath('/no-such-post')).toBe(true)
    expect(isMissingPath('/tag/zzz-none')).toBe(true)
    expect(isMissingPath('/category/nope')).toBe(true)
    expect(isMissingPath('/tag/%E0%A4%A')).toBe(true)
  })

  it('passes posts, tags, and categories that exist, in any case', () => {
    expect(isMissingPath('/hello-world')).toBe(false)
    expect(isMissingPath('/tag/HDR')).toBe(false)
    expect(isMissingPath('/tag/caf%C3%A9')).toBe(false)
    expect(isMissingPath('/category/Code')).toBe(false)
  })

  it('passes the home page, files, and paths other routes own', () => {
    for (const path of [
      '/',
      '/feed.xml',
      '/hello-world.md',
      '/opengraph-image-19c4ir',
      '/hello-world/opengraph-image-19c4ir',
      '/tag/hdr/extra',
      '/api/health',
      '/constructor/x',
    ]) {
      expect(isMissingPath(path), path).toBe(false)
    }
  })

  it('passes every top-level route in app/', () => {
    for (const name of [...routeFolders('app'), ...routeFolders('app/(site)')]) {
      expect(isMissingPath(`/${name}`), name).toBe(false)
    }
  })
})

describe('proxy', () => {
  it('runs only on paths a post, tag, or category page could take', () => {
    const nextConfig = {}
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/no-such-post' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/tag/x' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/health' })).toBe(false)
  })

  it('rewrites missing paths to one no route matches, and passes the rest', () => {
    const missing = proxy(new NextRequest('https://gregrickaby.com/no-such-post'))
    expect(isRewrite(missing)).toBe(true)
    expect(getRewrittenUrl(missing)).toBe('https://gregrickaby.com/404/missing')
    expect(isRewrite(proxy(new NextRequest('https://gregrickaby.com/hello-world')))).toBe(false)
  })
})
