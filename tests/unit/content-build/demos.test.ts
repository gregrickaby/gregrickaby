import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { buildDemoRegistry } from '@/lib/content-build/demos'

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function fixture(folders: Record<string, boolean>): string {
  const dir = mkdtempSync(join(tmpdir(), 'demos-'))
  dirs.push(dir)
  for (const [slug, hasRegistry] of Object.entries(folders)) {
    mkdirSync(join(dir, slug))
    if (hasRegistry) writeFileSync(join(dir, slug, 'registry.ts'), '')
  }
  return dir
}

describe('buildDemoRegistry', () => {
  it('imports each post folder with a registry, keyed by slug, in order', () => {
    const source = buildDemoRegistry(fixture({ 'b-post': true, 'a-post': true, draft: false }))
    expect(source).toContain(
      "import { DEMOS as demos0 } from '@/components/islands/demos/a-post/registry'",
    )
    expect(source).toContain("  'a-post': demos0,\n  'b-post': demos1,")
    expect(source).not.toContain('draft')
  })

  it('writes an empty registry when there are no demos', () => {
    const source = buildDemoRegistry(join(tmpdir(), 'no-such-folder'))
    expect(source).toContain(
      'export const POST_DEMOS: Record<string, Record<string, DemoEntry>> = {\n}',
    )
  })
})
