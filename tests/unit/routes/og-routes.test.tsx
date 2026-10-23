import { describe, expect, it, vi } from 'vitest'

import { contentIndex, photo } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

const renderOgImage = vi.fn(async (card: unknown) => card)
vi.mock('@/lib/og', () => ({
  OG_SIZE: { width: 1200, height: 630 },
  OG_CONTENT_TYPE: 'image/png',
  renderOgImage,
}))

const root = await import('@/app/opengraph-image')
const post = await import('@/app/(site)/[slug]/opengraph-image')
const resume = await import('@/app/(site)/resume/opengraph-image')
const photos = await import('@/app/(site)/photos/opengraph-image')
const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('share image routes', () => {
  it('home uses the hero photo and the name, without a byline', async () => {
    expect(await root.default()).toMatchObject({
      title: 'Greg Rickaby',
      byline: false,
      photo: expect.stringContaining('/content/photos/'),
    })
    expect(root.size).toEqual({ width: 1200, height: 630 })
  })

  it('posts use their photo, date, and category', async () => {
    expect(post.generateStaticParams()).toContainEqual({ slug: 'middle' })
    expect(await post.default(params('middle'))).toEqual({
      title: 'Middle Post',
      eyebrow: 'Jan 1, 2024 · Code',
      photo: '/content/posts/middle/hero.jpg',
    })
    expect(await post.default(params('oldest'))).toMatchObject({
      eyebrow: 'Jan 1, 2013',
      photo: undefined,
    })
    expect(await post.default(params('missing'))).toEqual({
      title: 'Blog',
      eyebrow: undefined,
      photo: undefined,
    })
  })

  it('the resume shows the current role', async () => {
    expect(await resume.default()).toMatchObject({ title: 'Technical Lead, Mindsize' })
  })

  it('photos use the newest landscape photo, or any photo', async () => {
    const saved = index.photos
    index.photos = [
      photo({ filename: 'tall.jpg', width: 1000, height: 1500 }),
      photo({ filename: 'wide.jpg' }),
    ]
    expect(await photos.default()).toMatchObject({
      title: 'Photos',
      photo: '/content/photos/wide.jpg',
    })
    index.photos = [photo({ filename: 'tall.jpg', width: 1000, height: 1500 })]
    expect(await photos.default()).toMatchObject({ photo: '/content/photos/tall.jpg' })
    index.photos = []
    expect(await photos.default()).toMatchObject({ photo: undefined, eyebrow: '0 photographs' })
    index.photos = saved
  })
})
