import { describe, expect, it } from 'vitest'

import { buildPostMarkdown } from '@/lib/content-build/post-markdown'

const meta = {
  title: 'First Post',
  slug: 'first-post',
  date: '2024-01-11T16:13:21',
  description: 'A post about the moon.',
}
const basePath = '/content/posts/first-post'
const media = 'https://gregrickaby.com/content/posts/first-post'

describe('buildPostMarkdown', () => {
  it('opens with the title, URL, date, and description', () => {
    expect(buildPostMarkdown('Hello moon\n', { meta, basePath })).toBe(
      [
        '# First Post',
        '',
        '- URL: <https://gregrickaby.com/first-post>',
        '- Published: 2024-01-11',
        '',
        'A post about the moon.',
        '',
        'Hello moon',
        '',
      ].join('\n'),
    )
  })

  it('leaves out a missing date and description', () => {
    const markdown = buildPostMarkdown('Hi', {
      meta: { title: 'T', slug: 't', date: '' },
      basePath,
    })
    expect(markdown).toBe('# T\n\n- URL: <https://gregrickaby.com/t>\n\nHi\n')
  })

  it('points relative images and media at the live site', () => {
    const body = [
      '![Moon](./moon.jpg "The moon") and ![Sun](./sun.jpg)',
      '<img src="./photo.jpg" alt="" />',
      '<audio src="./clip.mp3"></audio> <a href="./notes.pdf">Notes</a>',
      '![Remote](https://example.com/a.jpg) <img src="/content/x.jpg">',
    ].join('\n')
    const markdown = buildPostMarkdown(body, { meta, basePath })
    expect(markdown).toContain(`![Moon](${media}/moon.jpg "The moon") and ![Sun](${media}/sun.jpg)`)
    expect(markdown).toContain(`<img src="${media}/photo.jpg" alt="" />`)
    expect(markdown).toContain(`<audio src="${media}/clip.mp3"></audio>`)
    expect(markdown).toContain(`<a href="${media}/notes.pdf">Notes</a>`)
    expect(markdown).toContain('![Remote](https://example.com/a.jpg) <img src="/content/x.jpg">')
  })

  it('swaps demo markers for a line that links to the post', () => {
    const markdown = buildPostMarkdown(
      'Intro\n\n<div data-demo="wave"></div>\n\n  <div data-demo="other"></div>',
      { meta, basePath, demoTitles: { wave: 'Make a wave' } },
    )
    expect(markdown).toContain(
      '_Interactive demo: Make a wave. Try it at <https://gregrickaby.com/first-post>._',
    )
    // A demo missing from the registry goes by its name.
    expect(markdown).toContain('_Interactive demo: other. Try it at')
    expect(markdown).not.toContain('data-demo')
  })

  it('removes like cues', () => {
    const markdown = buildPostMarkdown('Click the heart. <span data-like-cue></span>\n', {
      meta,
      basePath,
    })
    expect(markdown).toContain('Click the heart.\n')
    expect(markdown).not.toContain('data-like-cue')
  })

  it('leaves code fences as written', () => {
    const fenced = [
      '```html',
      '<div data-demo="wave"></div>',
      '<img src="./photo.jpg">',
      '~~~',
      '```',
      '~~~~md',
      '![Moon](./moon.jpg) <span data-like-cue></span>',
      '```',
      '~~~~',
    ].join('\n')
    const markdown = buildPostMarkdown(`${fenced}\n\n![After](./after.jpg)`, {
      meta,
      basePath,
      demoTitles: { wave: 'Make a wave' },
    })
    expect(markdown).toContain(fenced)
    expect(markdown).toContain(`![After](${media}/after.jpg)`)
  })
})
