import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { redirects } from '@/lib/redirects'
import type { KnownPaths } from '@/lib/types'

/** The real content's paths, which the content build writes before the tests run. */
const paths = JSON.parse(
  readFileSync(join(process.cwd(), '.generated', 'paths.json'), 'utf-8'),
) as KnownPaths

describe('redirects', () => {
  it('sends only pages the home page replaces to the home page', () => {
    const home = redirects.filter((r) => r.destination === '/').map((r) => r.source)
    expect(home).toEqual(['/about', '/home'])
  })

  it('has no duplicate source paths', () => {
    const sources = redirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('never sends a live post, tag, or category somewhere else', () => {
    const live = new Set([
      ...paths.posts.map((slug) => `/${slug}`),
      ...paths.tags.map((name) => `/tag/${name}`),
      ...paths.categories.map((name) => `/category/${name}`),
    ])
    const shadowing = redirects.filter((r) => live.has(r.source.toLowerCase().replace(/\/$/, '')))
    expect(shadowing.map((r) => r.source)).toEqual([])
  })

  it('has no source with a trailing slash, which Next strips before matching', () => {
    expect(redirects.filter((r) => r.source.endsWith('/')).map((r) => r.source)).toEqual([])
  })

  it('marks every redirect as permanent', () => {
    expect(redirects.every((r) => r.permanent)).toBe(true)
  })
})
