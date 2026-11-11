import { afterEach, describe, expect, it, vi } from 'vitest'

import { contentIndex, post } from '@/tests/helpers/content'

vi.mock('@/.generated/content.json', () => ({ default: contentIndex() }))

const content = await import('@/lib/content')

describe('content', () => {
  it('lists post metadata newest first', () => {
    expect(content.getAllPosts().map((p) => p.slug)).toEqual(['newest', 'middle', 'oldest'])
  })

  it('finds posts and pages by slug', () => {
    expect(content.getPost('middle')?.meta.title).toBe('Middle Post')
    expect(content.getPost('missing')).toBeNull()
    expect(content.getPage('about')?.html).toBe('<p>Hello there</p>')
    expect(content.getPage('missing')).toBeNull()
  })

  it('returns photos and the build time', () => {
    expect(content.getPhotos()).toHaveLength(2)
    expect(content.getBuildTime()).toBe('2026-10-11T20:00:00.000Z')
  })

  it('filters by category and tag without regard to case', () => {
    expect(content.getPostsByCategory('code').map((p) => p.slug)).toEqual(['middle'])
    expect(content.getPostsByTag('MOON').map((p) => p.slug)).toEqual(['newest'])
    expect(content.getPostsByTag('nope')).toEqual([])
  })

  it('lists unique categories and tags, sorted', () => {
    expect(content.getAllCategories()).toEqual(['Blog', 'Code'])
    expect(content.getAllTags()).toEqual(['Moon', 'PHP'])
  })

  it('finds the older and newer neighbors of a post', () => {
    expect(content.getAdjacentPosts('middle')).toMatchObject({
      older: { slug: 'oldest' },
      newer: { slug: 'newest' },
    })
    expect(content.getAdjacentPosts('newest').newer).toBeNull()
    expect(content.getAdjacentPosts('oldest').older).toBeNull()
    expect(content.getAdjacentPosts('missing')).toEqual({ older: null, newer: null })
  })

  it('searches titles, descriptions, categories, and tags for every word', () => {
    expect(content.searchPosts('wordpress SNIPPETS').map((p) => p.slug)).toEqual(['middle'])
    expect(content.searchPosts('code').map((p) => p.slug)).toEqual(['middle'])
    expect(content.searchPosts('moon post').map((p) => p.slug)).toEqual(['newest'])
    expect(content.searchPosts('   ')).toEqual([])
    expect(content.searchPosts('zebra')).toEqual([])
  })
})

describe('production content', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalEnv ?? 'test')
    vi.doUnmock('@/.generated/content.json')
    vi.resetModules()
  })

  it('fails to load when the production index holds a draft', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    vi.doMock('@/.generated/content.json', () => ({
      default: { ...contentIndex(), posts: [post({ slug: 'wip', draft: true })] },
    }))

    await expect(import('@/lib/content')).rejects.toThrow('Draft content reached production: wip')
  })
})
