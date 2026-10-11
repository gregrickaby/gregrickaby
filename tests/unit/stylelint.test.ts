import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import plugin from '@/stylelint/require-components-layer.mjs'

const RULE = 'gregrickaby/require-components-layer'

async function lint(code: string, codeFilename?: string, enabled = true) {
  const { results } = await stylelint.lint({
    code,
    codeFilename,
    config: { plugins: [plugin], rules: { [RULE]: enabled } },
  })
  return results[0]?.warnings.map((w) => w.text) ?? []
}

describe(RULE, () => {
  it('accepts CSS Modules wrapped in @layer components, with comments', async () => {
    expect(
      await lint('/* hi */\n@layer components { .a { color: red; } }', 'x.module.css'),
    ).toEqual([])
  })

  it('rejects top-level rules and other layers in CSS Modules', async () => {
    const warnings = await lint('.a { color: red; }\n@layer base { .b {} }', 'x.module.css')
    expect(warnings).toHaveLength(2)
    expect(warnings[0]).toMatch(/@layer components/)
  })

  it('ignores global stylesheets, input without a filename, and a disabled rule', async () => {
    expect(await lint('.a { color: red; }', 'app/styles/base.css')).toEqual([])
    expect(await lint('.a { color: red; }', 'x.module.css', false)).toEqual([])
    expect(await lint('.a {}')).toEqual([])
  })
})
