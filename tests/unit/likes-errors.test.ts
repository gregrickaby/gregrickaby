import { describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

// A file can't hold a folder, so opening the database fails.
vi.stubEnv('LIKES_DB_PATH', 'package.json/likes.db')

const { likePost } = await import('@/lib/like-post')

describe('likePost without a database', () => {
  it('logs and leaves the button as it was', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const before = { count: 3, mine: 0 }
    const data = new FormData()
    data.set('slug', index.posts[0]!.meta.slug)
    expect(await likePost(before, data)).toBe(before)
    expect(log).toHaveBeenCalledWith(
      'Could not save a like',
      expect.objectContaining({ error: expect.any(String) }),
    )
  })
})
