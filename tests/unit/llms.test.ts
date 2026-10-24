import { describe, expect, it } from 'vitest'

import { buildLlmsTxt, buildPhotosMarkdown, buildResumeMarkdown } from '@/lib/llms'
import type { Photo, PostMeta } from '@/lib/types'

const CONFIG = {
  url: 'https://example.com',
  name: 'Test Blog',
  description: 'A test blog.',
}

const NEWER: PostMeta = {
  title: 'Hello World',
  slug: 'hello-world',
  date: '2024-01-10T00:00:00.000Z',
  modified: '2024-01-10T00:00:00.000Z',
  type: 'post',
  description: 'My first post.',
}

const OLDER: PostMeta = {
  title: 'No Description',
  slug: 'no-description',
  date: '2024-01-09T00:00:00.000Z',
  modified: '2024-01-09T00:00:00.000Z',
  type: 'post',
}

describe('buildLlmsTxt', () => {
  it('starts with the site name and a summary blockquote', () => {
    const text = buildLlmsTxt([], CONFIG)
    expect(text).toMatch(/^# Test Blog\n\n> A test blog\.\n\n/)
  })

  it('links each post to its absolute Markdown URL, in the order given', () => {
    const text = buildLlmsTxt([NEWER, OLDER], CONFIG)
    const section = text.slice(text.indexOf('## Posts'), text.indexOf('## Optional'))
    const posts = section.split('\n').filter((line) => line.startsWith('- ['))
    expect(posts).toEqual([
      '- [Hello World](https://example.com/hello-world.md): My first post.',
      '- [No Description](https://example.com/no-description.md)',
    ])
  })

  it('ends with an Optional section that links Markdown copies only', () => {
    const text = buildLlmsTxt([NEWER], CONFIG)
    const optional = text.slice(text.indexOf('## Optional'))
    const links = [...optional.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1])
    expect(links).toEqual(['https://example.com/resume.md', 'https://example.com/photos.md'])
    expect(text.endsWith('\n')).toBe(true)
  })
})

describe('buildResumeMarkdown', () => {
  const markdown = buildResumeMarkdown(new Date('2026-06-01T00:00:00Z'))

  it('opens with the title, links, and summary facts', () => {
    expect(markdown).toMatch(
      /^# Resume: Greg Rickaby\n\n- URL: <https:\/\/gregrickaby\.com\/resume>/,
    )
    expect(markdown).toContain('- On the web: 29 years, since 1997')
    expect(markdown).toContain('- Now: Technical Lead, Mindsize')
  })

  it('links a company only when it has a website', () => {
    expect(markdown).toContain('### Technical Lead, [Mindsize](https://mindsize.com)')
    expect(markdown).toContain('### Team Lead, WPForms.com\n')
  })

  it('writes other experience with italic book links and a list', () => {
    expect(markdown).toContain(
      "In 2017, I wrote a children's book, [_Creating a Website for Dummies Jr_](https://amzn.to/41eZFfF), published by Wiley Global under the [dummies™](https://www.dummies.com/) brand.",
    )
    expect(markdown).toContain(
      '- [_WordPress for Dummies_](https://amzn.to/44EeXgy) (Sabin-Wilson, 2021)',
    )
    expect(markdown).toContain('### Contributor\n\nI was part of the WordPress community')
  })
})

describe('buildPhotosMarkdown', () => {
  const PHOTO: Photo = {
    filename: 'Orion Nebula (M42).jpg',
    src: '/content/photos/Orion Nebula (M42).jpg',
    width: 100,
    height: 100,
    hdr: false,
    title: 'Orion Nebula',
    caption: 'The nebula in winter',
    camera: 'SONY ILCE-7RM5',
    aperture: 'f/2.8',
    dateTaken: '2025-03-23T02:00:00.000Z',
  }

  it('encodes spaces and parentheses so the image link stays intact', () => {
    expect(buildPhotosMarkdown([PHOTO])).toContain(
      '![Orion Nebula](https://gregrickaby.com/content/photos/Orion%20Nebula%20%28M42%29.jpg)',
    )
  })

  it('adds the caption, then the date and camera settings', () => {
    expect(buildPhotosMarkdown([PHOTO])).toContain(
      '## Orion Nebula\n\n![Orion Nebula](https://gregrickaby.com/content/photos/Orion%20Nebula%20%28M42%29.jpg)\n\nThe nebula in winter\n\nTaken Mar 23, 2025 · SONY ILCE-7RM5 · f/2.8\n',
    )
  })

  it("skips the caption and details a photo doesn't have", () => {
    const bare: Photo = {
      ...PHOTO,
      caption: undefined,
      camera: undefined,
      aperture: undefined,
      dateTaken: undefined,
    }
    expect(buildPhotosMarkdown([bare])).toMatch(/## Orion Nebula\n\n!\[Orion Nebula\]\([^)]+\)\n$/)
  })

  it('says so when there are no photos', () => {
    expect(buildPhotosMarkdown([])).toContain('No photos yet.')
  })
})
