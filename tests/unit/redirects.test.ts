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
  it('places the date-based catch-all last', () => {
    const catchAllIndex = redirects.findIndex((r) => r.source.includes('20[0-9]{2}'))
    expect(catchAllIndex).toBe(redirects.length - 1)
  })

  it('places specific WordPress date-based redirects before the catch-all', () => {
    const catchAllIndex = redirects.findIndex((r) => r.source.includes('20[0-9]{2}'))
    const specificDateRedirectIndex = redirects.findIndex(
      (r) => r.source === '/2011/05/how-to-install-lamp-on-ubuntu-1104-natty.html',
    )
    expect(specificDateRedirectIndex).toBeGreaterThanOrEqual(0)
    expect(specificDateRedirectIndex).toBeLessThan(catchAllIndex)
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

  it('marks every redirect as permanent', () => {
    expect(redirects.every((r) => r.permanent)).toBe(true)
  })
})
