import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { KnownPaths } from '@/lib/types'

/*
 * A name that needs percent-encoding prerenders its tag or category page as a
 * 404, so names stay to letters, digits, and hyphens.
 */
const URL_SAFE = /^[a-z0-9-]+$/

const paths = JSON.parse(
  readFileSync(join(process.cwd(), '.generated', 'paths.json'), 'utf-8'),
) as KnownPaths

describe('tag and category names', () => {
  it('uses only letters, digits, and hyphens in every tag', () => {
    expect(paths.tags.filter((name) => !URL_SAFE.test(name))).toEqual([])
  })

  it('uses only letters, digits, and hyphens in every category', () => {
    expect(paths.categories.filter((name) => !URL_SAFE.test(name))).toEqual([])
  })
})
