import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { buildContent, decodeEntities, readingMinutes } from '@/lib/content-build/build'

// A 2x1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGP4z8DwnxHGAAAzfgP+AeGeFwAAAABJRU5ErkJggg==',
  'base64',
)

let root = ''

function write(path: string, body: string | Buffer) {
  const file = join(root, path)
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, body)
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'content-'))
  write(
    'content/posts/older/content.mdx',
    "---\ntitle: 'Old &#38; Gold'\ndate: '2013-05-19T08:03:21'\ntype: 'post'\nfeaturedImage: './cover.png'\ndescription: 'Rock &#38; roll'\ncategories: ['Code']\ntags: ['PHP']\n---\n\n![Cover](./cover.png)\n",
  )
  write('content/posts/older/cover.png', PNG)
  write(
    'content/posts/newer/content.mdx',
    "---\ntitle: 'Newer'\nslug: 'newer'\ndate: '2024-01-11T16:13:21'\nmodified: '2024-02-01T00:00:00'\nfeaturedImage: './hero.png'\n---\n\nHello\n",
  )
  write('content/posts/newer/hero.png', PNG)
  write('content/posts/empty/notes.txt', 'no content file')
  write(
    'content/pages/gone/content.mdx',
    "---\ntitle: 'Gone'\nfeaturedImage: './missing.png'\n---\n\n![A](./missing.png)\n\n![B](./missing.png)\n",
  )
  write('content/pages/about/content.mdx', "---\ntitle: 'About'\n---\n\nHi\n")
  write('content/pages/untitled/content.mdx', '---\n---\n\nNo frontmatter\n')
  write('content/photos/b.png', PNG)
  write('content/photos/readme.txt', 'skip')
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('decodeEntities', () => {
  it('decodes numeric entities', () => {
    expect(decodeEntities('A &#38; B &#8217;')).toBe('A & B ’')
  })
})

describe('readingMinutes', () => {
  it('counts prose at 230 words a minute, skipping code and tags, never under one', () => {
    expect(readingMinutes('word '.repeat(690))).toBe(3)
    expect(readingMinutes('```\n' + 'code '.repeat(5000) + '\n```\nhi <b>there</b>')).toBe(1)
    expect(readingMinutes('')).toBe(1)
  })
})

describe('buildContent', () => {
  it('reads posts newest first, with metadata, HTML, and heroes', async () => {
    const index = await buildContent(root, new Date('2026-01-01T00:00:00Z'))
    expect(index.generatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(index.posts.map((p) => p.meta.slug)).toEqual(['newer', 'older'])

    const [newer, older] = index.posts
    expect(newer?.meta).toMatchObject({
      title: 'Newer',
      type: 'post',
      modified: '2024-02-01T00:00:00',
      featuredImage: { src: '/content/posts/newer/hero.png', width: 2, height: 1 },
    })
    expect(newer?.hero?.src).toBe('/content/posts/newer/hero.png')

    expect(older?.meta).toMatchObject({
      title: 'Old & Gold',
      slug: 'older',
      description: 'Rock & roll',
      modified: '2013-05-19T08:03:21',
      categories: ['Code'],
      tags: ['PHP'],
    })
    // The body opens with the featured image, so the page skips the hero.
    expect(older?.hero).toBeNull()
    expect(older?.html).toContain('width="2"')
  })

  it('reads pages with defaults for missing frontmatter', async () => {
    const { pages } = await buildContent(root)
    expect(pages.map((p) => p.meta.slug)).toEqual(['about', 'gone', 'untitled'])
    expect(pages[2]?.meta.title).toBe('untitled')
    expect(pages[0]?.meta).toMatchObject({ title: 'About', slug: 'about', type: 'page', date: '' })
    expect(pages[0]?.meta.featuredImage).toBeUndefined()
    // A missing image is measured once, and the page keeps its path.
    expect(pages[1]?.meta.featuredImage).toBeUndefined()
    expect(pages[1]?.html).toContain('src="/content/pages/gone/missing.png"')
  })

  it('reads image files in the photos folder', async () => {
    const { photos } = await buildContent(root)
    expect(photos.map((p) => p.filename)).toEqual(['b.png'])
    expect(photos[0]).toMatchObject({ width: 2, height: 1, title: 'B' })
  })

  it('returns empty lists when the folders are missing', async () => {
    const empty = mkdtempSync(join(tmpdir(), 'empty-'))
    expect(await buildContent(empty)).toMatchObject({ posts: [], pages: [], photos: [] })
    rmSync(empty, { recursive: true, force: true })
  })
})
