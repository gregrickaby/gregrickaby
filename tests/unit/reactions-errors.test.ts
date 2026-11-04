import { describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

// A file can't hold a folder, so opening the database fails.
vi.stubEnv('LIKES_DB_PATH', 'package.json/likes.db')

const { reactToPost } = await import('@/lib/react-to-post')

describe('reactToPost without a database', () => {
  it('logs and leaves the buttons as they were', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const before = null
    const data = new FormData()
    data.set('slug', index.posts[0]!.meta.slug)
    data.set('reaction', 'fire')
    expect(await reactToPost(before, data)).toBe(before)
    expect(log).toHaveBeenCalledWith(
      'Could not save a reaction',
      expect.objectContaining({ error: expect.any(String) }),
    )
  })
})
