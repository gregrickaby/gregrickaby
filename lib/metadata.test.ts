import type {ResolvingMetadata} from 'next'
import {siteConfig} from './config'
import {buildContentMetadata} from './metadata'
import type {PostMeta} from './types'

const baseMeta: PostMeta = {
  title: 'Test Page',
  slug: 'test-page',
  date: '2024-06-01T00:00:00Z',
  modified: '2024-06-15T00:00:00Z',
  type: 'page',
  description: 'A test description.'
}

const postMeta: PostMeta = {
  ...baseMeta,
  slug: 'test-post',
  type: 'post'
}

function makeParent(images: {url: string}[] = []): ResolvingMetadata {
  return Promise.resolve({openGraph: {images}}) as unknown as ResolvingMetadata
}

describe('buildContentMetadata', () => {
  it('returns title and description from meta', async () => {
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent()
    )
    expect(result.title).toBe('Test Page')
    expect(result.description).toBe('A test description.')
  })

  it('sets alternates.canonical to canonicalPath', async () => {
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent()
    )
    expect(result.alternates?.canonical).toBe('/test-page')
  })

  it('constructs openGraph.url from siteConfig.url and canonicalPath', async () => {
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent()
    )
    expect(result.openGraph?.url).toBe(`${siteConfig.url}/test-page`)
  })

  it('prepends featured image before inherited parent images when featuredImage is set', async () => {
    const meta: PostMeta = {...baseMeta, featuredImage: './hero.jpg'}
    const parentImages = [{url: 'https://example.com/parent.jpg'}]
    const result = await buildContentMetadata(
      meta,
      '/test-page',
      makeParent(parentImages)
    )
    const images = result.openGraph?.images as {url: string}[]
    expect(images[0].url).toBe(
      `${siteConfig.url}/content/pages/test-page/hero.jpg`
    )
    expect(images[1].url).toBe('https://example.com/parent.jpg')
  })

  it('omits featured image from openGraph.images when featuredImage is absent', async () => {
    const parentImages = [{url: 'https://example.com/parent.jpg'}]
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent(parentImages)
    )
    const images = result.openGraph?.images as {url: string}[]
    expect(images).toHaveLength(1)
    expect(images[0].url).toBe('https://example.com/parent.jpg')
  })

  it('inherits parent images even when no featured image is present', async () => {
    const parentImages = [{url: 'https://example.com/og.jpg'}]
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent(parentImages)
    )
    const images = result.openGraph?.images as {url: string}[]
    expect(images).toHaveLength(1)
    expect(images[0].url).toBe('https://example.com/og.jpg')
  })

  it('emits type article, publishedTime, and modifiedTime for meta.type post', async () => {
    const result = await buildContentMetadata(
      postMeta,
      '/test-post',
      makeParent()
    )
    expect(result.openGraph).toMatchObject({
      type: 'article',
      publishedTime: postMeta.date,
      modifiedTime: postMeta.modified
    })
  })

  it('does not emit article fields for meta.type page', async () => {
    const result = await buildContentMetadata(
      baseMeta,
      '/test-page',
      makeParent()
    )
    expect(result.openGraph).not.toHaveProperty('type')
    expect(result.openGraph).not.toHaveProperty('publishedTime')
    expect(result.openGraph).not.toHaveProperty('modifiedTime')
  })

  it('omits publishedTime and modifiedTime when dates are invalid', async () => {
    const meta: PostMeta = {
      ...postMeta,
      date: 'not-a-date',
      modified: 'also-not-a-date'
    }
    const result = await buildContentMetadata(meta, '/test-post', makeParent())
    expect(result.openGraph).toMatchObject({type: 'article'})
    expect(result.openGraph).not.toHaveProperty('publishedTime')
    expect(result.openGraph).not.toHaveProperty('modifiedTime')
  })
})
