import {buildFeedXml} from '@/lib/feed'
import type {PostMeta} from '@/lib/types'

const BASE_CONFIG = {
  url: 'https://example.com',
  name: 'Test Blog',
  description: 'A test blog.'
}

const BUILT_AT = new Date('2024-01-15T12:00:00.000Z')

const POST_FULL: PostMeta = {
  title: 'Hello World',
  slug: 'hello-world',
  date: '2024-01-10T00:00:00.000Z',
  modified: '2024-01-10T00:00:00.000Z',
  type: 'post',
  description: 'My first post.',
  categories: ['JavaScript', 'Next.js']
}

const POST_NO_DESCRIPTION: PostMeta = {
  title: 'No Description',
  slug: 'no-description',
  date: '2024-01-09T00:00:00.000Z',
  modified: '2024-01-09T00:00:00.000Z',
  type: 'post'
}

const POST_NO_CATEGORIES: PostMeta = {
  title: 'No Categories',
  slug: 'no-categories',
  date: '2024-01-08T00:00:00.000Z',
  modified: '2024-01-08T00:00:00.000Z',
  type: 'post',
  description: 'A post without categories.'
}

describe('buildFeedXml', () => {
  it('output starts with XML declaration and RSS root element', () => {
    const xml = buildFeedXml([], BASE_CONFIG, BUILT_AT)
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
    expect(xml).toContain('<rss version="2.0"')
  })

  it('channel title, link, and description match the passed config', () => {
    const xml = buildFeedXml([], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain(`<title>${BASE_CONFIG.name}</title>`)
    expect(xml).toContain(`<link>${BASE_CONFIG.url}</link>`)
    expect(xml).toContain(
      `<description>${BASE_CONFIG.description}</description>`
    )
  })

  it('lastBuildDate matches the passed builtAt Date', () => {
    const xml = buildFeedXml([], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain(
      `<lastBuildDate>${BUILT_AT.toUTCString()}</lastBuildDate>`
    )
  })

  it('each post produces an item with title, link, guid, pubDate, and description', () => {
    const xml = buildFeedXml([POST_FULL], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain(`<title><![CDATA[${POST_FULL.title}]]></title>`)
    expect(xml).toContain(`<link>${BASE_CONFIG.url}/${POST_FULL.slug}</link>`)
    expect(xml).toContain(
      `<guid isPermaLink="true">${BASE_CONFIG.url}/${POST_FULL.slug}</guid>`
    )
    expect(xml).toContain(
      `<pubDate>${new Date(POST_FULL.date).toUTCString()}</pubDate>`
    )
    expect(xml).toContain(
      `<description><![CDATA[${POST_FULL.description}]]></description>`
    )
  })

  it('posts with categories emit category elements', () => {
    const xml = buildFeedXml([POST_FULL], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain('<category><![CDATA[JavaScript]]></category>')
    expect(xml).toContain('<category><![CDATA[Next.js]]></category>')
  })

  it('posts with no description emit an empty description element', () => {
    const xml = buildFeedXml([POST_NO_DESCRIPTION], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain('<description><![CDATA[]]></description>')
  })

  it('posts with no categories emit no category elements', () => {
    const xml = buildFeedXml([POST_NO_CATEGORIES], BASE_CONFIG, BUILT_AT)
    expect(xml).not.toContain('<category>')
  })

  it('empty post array produces a valid feed with no item elements', () => {
    const xml = buildFeedXml([], BASE_CONFIG, BUILT_AT)
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</channel>')
    expect(xml).not.toContain('<item>')
  })
})
