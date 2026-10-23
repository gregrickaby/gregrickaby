import type { ResolvingMetadata } from 'next'
import { describe, expect, it } from 'vitest'

import { buildContentMetadata } from '@/lib/metadata'
import { SITE } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

const baseMeta: PostMeta = {
  title: 'Test Page',
  slug: 'test-page',
  date: '2024-06-01T00:00:00Z',
  modified: '2024-06-15T00:00:00Z',
  type: 'page',
  description: 'A test description.',
}

const postMeta: PostMeta = {
  ...baseMeta,
  slug: 'test-post',
  type: 'post',
}

function makeParent(images: { url: string }[] = []): ResolvingMetadata {
  return Promise.resolve({ openGraph: { images } }) as unknown as ResolvingMetadata
}

describe('buildContentMetadata', () => {
  it('returns title and description from meta', async () => {
    const result = await buildContentMetadata(baseMeta, '/test-page', makeParent())
    expect(result.title).toBe('Test Page')
    expect(result.description).toBe('A test description.')
  })

  it('sets alternates.canonical to canonicalPath', async () => {
    const result = await buildContentMetadata(baseMeta, '/test-page', makeParent())
    expect(result.alternates?.canonical).toBe('/test-page')
  })

  it('constructs openGraph.url from SITE.url and canonicalPath', async () => {
    const result = await buildContentMetadata(baseMeta, '/test-page', makeParent())
    expect(result.openGraph?.url).toBe(`${SITE.url}/test-page`)
  })

  it('keeps the inherited share image, which the opengraph-image routes generate', async () => {
    const parentImages = [{ url: 'https://example.com/og.jpg' }]
    const result = await buildContentMetadata(baseMeta, '/test-page', makeParent(parentImages))
    const images = result.openGraph?.images as { url: string }[]
    expect(images).toHaveLength(1)
    expect(images[0]!.url).toBe('https://example.com/og.jpg')
  })

  it('emits type article, publishedTime, and modifiedTime for meta.type post', async () => {
    const result = await buildContentMetadata(postMeta, '/test-post', makeParent())
    expect(result.openGraph).toMatchObject({
      type: 'article',
      publishedTime: postMeta.date,
      modifiedTime: postMeta.modified,
    })
  })

  it('does not emit article fields for meta.type page', async () => {
    const result = await buildContentMetadata(baseMeta, '/test-page', makeParent())
    expect(result.openGraph).not.toHaveProperty('type')
    expect(result.openGraph).not.toHaveProperty('publishedTime')
    expect(result.openGraph).not.toHaveProperty('modifiedTime')
  })

  it('omits publishedTime and modifiedTime when dates are invalid', async () => {
    const meta: PostMeta = {
      ...postMeta,
      date: 'not-a-date',
      modified: 'also-not-a-date',
    }
    const result = await buildContentMetadata(meta, '/test-post', makeParent())
    expect(result.openGraph).toMatchObject({ type: 'article' })
    expect(result.openGraph).not.toHaveProperty('publishedTime')
    expect(result.openGraph).not.toHaveProperty('modifiedTime')
  })

  it('works when the parent has no Open Graph images', async () => {
    const parent = Promise.resolve({}) as unknown as ResolvingMetadata
    const result = await buildContentMetadata(baseMeta, '/x', parent)
    expect(result.openGraph?.images).toEqual([])
  })
})
