import { beforeEach, describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

const request = new Headers()
vi.mock('next/headers', () => ({ headers: async () => request }))

vi.stubEnv('LIKES_DB_PATH', ':memory:')
vi.stubEnv('LIKES_SALT', 'pepper')

const { addLike, countLikes, hashVisitor } = await import('@/lib/likes')
const { getLikeCount, likePost } = await import('@/lib/like-post')

function form(slug: string | null) {
  const data = new FormData()
  if (slug !== null) data.set('slug', slug)
  return data
}

beforeEach(() => {
  for (const name of [...request.keys()]) request.delete(name)
})

describe('likes store', () => {
  it('counts one like per visitor per post', async () => {
    expect(addLike('store', 'a')).toBe(true)
    expect(addLike('store', 'a')).toBe(false)
    expect(addLike('store', 'b')).toBe(true)
    expect(countLikes('store')).toBe(2)
    expect(countLikes('nothing')).toBe(0)
  })

  it('hashes visitors with the salt, never storing the address', () => {
    expect(hashVisitor('203.0.113.9')).toMatch(/^[0-9a-f]{64}$/)
    expect(hashVisitor('203.0.113.9')).not.toBe(hashVisitor('203.0.113.10'))
  })

  it('still hashes without a salt', () => {
    const salted = hashVisitor('203.0.113.9')
    vi.stubEnv('LIKES_SALT', undefined)
    expect(hashVisitor('203.0.113.9')).not.toBe(salted)
    vi.stubEnv('LIKES_SALT', 'pepper')
  })
})

describe('likePost', () => {
  const before = { count: null, liked: false }

  it('likes a post once per Cloudflare IP', async () => {
    request.set('cf-connecting-ip', '203.0.113.1')
    expect(await likePost(before, form('newest'))).toEqual({ count: 1, liked: true })
    expect(await likePost(before, form('newest'))).toEqual({ count: 1, liked: true })
    expect(await getLikeCount('newest')).toBe(1)
  })

  it('falls back to the first forwarded IP, then to one shared visitor', async () => {
    request.set('x-forwarded-for', '198.51.100.1, 10.0.0.1')
    expect(await likePost(before, form('middle'))).toEqual({ count: 1, liked: true })
    request.delete('x-forwarded-for')
    expect(await likePost(before, form('middle'))).toEqual({ count: 2, liked: true })
    expect(await likePost(before, form('middle'))).toEqual({ count: 2, liked: true })
  })

  it('ignores a missing slug, an unknown one, and pages', async () => {
    for (const slug of [null, 'nope', index.pages[0]!.meta.slug]) {
      expect(await likePost(before, form(slug))).toBe(before)
    }
    expect(await getLikeCount('nope')).toBe(0)
  })
})
