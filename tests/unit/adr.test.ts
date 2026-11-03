import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ADR_DIR = join(process.cwd(), 'docs/adr')
const AGENTS = readFileSync(join(process.cwd(), 'AGENTS.md'), 'utf8')
const ADRS = readdirSync(ADR_DIR).filter((file) => /^\d{4}-[a-z0-9-]+\.md$/.test(file))

describe('architecture decision records', () => {
  it('has a template and at least one record', () => {
    expect(existsSync(join(ADR_DIR, 'template.md'))).toBe(true)
    expect(ADRS.length).toBeGreaterThan(0)
  })

  it('names every file NNNN-short-slug.md, apart from the template', () => {
    const others = readdirSync(ADR_DIR).filter(
      (file) => file !== 'template.md' && !ADRS.includes(file),
    )
    expect(others).toEqual([])
  })

  it.each(ADRS)('links %s from AGENTS.md', (file) => {
    expect(AGENTS).toContain(`](docs/adr/${file})`)
  })

  it('links only records that exist', () => {
    const linked = [...AGENTS.matchAll(/\]\(docs\/adr\/([^)]+)\)/g)].map((match) => match[1])
    expect(linked.filter((file) => !existsSync(join(ADR_DIR, file ?? '')))).toEqual([])
  })
})
