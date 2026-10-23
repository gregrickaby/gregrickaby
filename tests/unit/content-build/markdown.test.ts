import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/lib/content-build/contrast'
import { CODE_BACKGROUND, type MeasureImage, renderMarkdown } from '@/lib/content-build/markdown'

const sizes: Record<string, { width: number; height: number; hdr: boolean }> = {
  '/content/posts/p/big.jpg': { width: 4000, height: 3000, hdr: false },
  '/content/posts/p/small.jpg': { width: 500, height: 400, hdr: false },
  '/content/posts/p/hdr.jpg': { width: 3000, height: 2000, hdr: true },
}
const measure: MeasureImage = (path) => sizes[path] ?? null
const render = (md: string) => renderMarkdown(md, { basePath: '/content/posts/p', measure })

describe('renderMarkdown', () => {
  it('renders GitHub-flavored Markdown with heading ids', async () => {
    const { html } = await render('## Camera Settings\n\n| a | b |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<h2 id="camera-settings">Camera Settings</h2>')
    expect(html).toContain('<table>')
  })

  it('turns a lone titled image into a figure with a caption', async () => {
    const { html, images } = await render('![A moon](./big.jpg "The <Wolf> Moon")')
    expect(html).toContain('<figure>')
    expect(html).toContain('<figcaption>The &lt;Wolf&gt; Moon</figcaption>')
    expect(images).toEqual(['/content/posts/p/big.jpg'])
  })

  it('captions images with an empty alt', async () => {
    const { html } = await render('![](./big.jpg "Caption")')
    expect(html).toContain('alt=""')
    expect(html).toContain('<figcaption>Caption</figcaption>')
  })

  it('sends local images through the optimizer with a srcset and their size', async () => {
    const { html } = await render('![A moon](./big.jpg)')
    expect(html).toContain('width="4000"')
    expect(html).toContain('height="3000"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('decoding="async"')
    expect(html).toContain('data-lightbox')
    expect(html).toContain(
      'src="/_next/image?url=%2Fcontent%2Fposts%2Fp%2Fbig.jpg&amp;w=1200&amp;q=75"',
    )
    expect(html).toContain('w=640&amp;q=75 640w')
    expect(html).toContain('w=1920&amp;q=75 1920w')
    expect(html).toContain('sizes="(max-width: 720px) 100vw, 680px"')
    expect(html).toContain(
      'data-full="/_next/image?url=%2Fcontent%2Fposts%2Fp%2Fbig.jpg&amp;w=3840',
    )
  })

  it('asks for the smallest width when the image is smaller than every width', async () => {
    const { html } = await render('![Small](./small.jpg)')
    expect(html).toContain('w=640&amp;q=75 640w"')
    expect(html).not.toContain('828w')
  })

  it('keeps HDR originals so the gain map survives', async () => {
    const { html } = await render('![HDR](./hdr.jpg)')
    expect(html).toContain('src="/content/posts/p/hdr.jpg"')
    expect(html).toContain('data-full="/content/posts/p/hdr.jpg"')
    expect(html).not.toContain('srcset')
  })

  it('leaves unmeasurable images at their path', async () => {
    const { html } = await render('![Gone](./missing.jpg)')
    expect(html).toContain('src="/content/posts/p/missing.jpg"')
    expect(html).not.toContain('width=')
  })

  it('sizes wide and full-width figures for their layout', async () => {
    const wide = await render(
      '<figure className="alignwide"><img src="./big.jpg" alt="" /></figure>',
    )
    expect(wide.html).toContain('sizes="(max-width: 1100px) 100vw, 1100px"')
    const full = await render('<figure class="alignfull"><img src="./big.jpg" alt="" /></figure>')
    expect(full.html).toContain('sizes="100vw"')
  })

  it('resolves relative media sources and leaves absolute ones alone', async () => {
    const { html } = await render(
      '<audio controls><source src="./a.mp3" type="audio/mpeg"></audio>\n\n![Remote](https://example.com/x.jpg)',
    )
    expect(html).toContain('src="/content/posts/p/a.mp3"')
    expect(html).toContain('src="https://example.com/x.jpg"')
  })

  it('highlights code blocks', async () => {
    const { html } = await render('```php\n<?php echo 1;\n```')
    expect(html).toContain('data-rehype-pretty-code-figure')
    expect(html).toContain('data-language="php"')
    expect(html).toMatch(/--shiki-light:#[0-9a-f]+;.*--shiki-dark:#[0-9a-f]+/i)
    expect(html).toContain('<button type="button" aria-label="Copy code" data-copy></button>')
  })

  it('highlights fences without a language as plain text', async () => {
    const { html } = await render('```\nplain\n```')
    expect(html).toContain('data-language="plaintext"')
    expect(html).toContain('data-copy')
  })

  it('gives every token AA contrast on the code background', async () => {
    const { html } = await render('```css\n/* note */\n.a { color: red; }\n```')
    const colors = [...html.matchAll(/--shiki-(light|dark):(#[0-9a-f]+)/gi)]
    expect(colors.length).toBeGreaterThan(0)
    for (const [, scheme, color] of colors) {
      expect(
        contrastRatio(color!, CODE_BACKGROUND[scheme as 'light' | 'dark']),
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('matches the code background to the --surface-code token', () => {
    const tokens = readFileSync('app/styles/tokens.css', 'utf8')
    const { light, dark } = CODE_BACKGROUND
    expect(tokens).toContain(`--surface-code: light-dark(${light}, ${dark});`)
  })

  it('strips scripts and event handlers', async () => {
    const { html } = await render('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })
})
