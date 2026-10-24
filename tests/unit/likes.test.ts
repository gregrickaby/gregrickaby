import { beforeEach, describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

const request = new Headers()
vi.mock('next/headers', () => ({ headers: async () => request }))

vi.stubEnv('LIKES_DB_PATH', ':memory:')
vi.stubEnv('LIKES_SALT', 'pepper')

const { addLike, countLikes, countVisitorLikes, hashVisitor } = await import('@/lib/likes')
const { getLikes, likePost } = await import('@/lib/like-post')

function form(slug: string | null) {
  const data = new FormData()
  if (slug !== null) data.set('slug', slug)
  return data
}

beforeEach(() => {
  for (const name of [...request.keys()]) request.delete(name)
})

describe('likes store', () => {
  it('counts up to ten likes per visitor per post', async () => {
    expect(addLike('store', 'a')).toBe(1)
    expect(addLike('store', 'a')).toBe(2)
    expect(addLike('store', 'b')).toBe(1)
    expect(countLikes('store')).toBe(3)
    for (let i = 0; i < 12; i++) addLike('store', 'a')
    expect(countVisitorLikes('store', 'a')).toBe(10)
    expect(countLikes('store')).toBe(11)
    expect(countLikes('nothing')).toBe(0)
    expect(countVisitorLikes('nothing', 'a')).toBe(0)
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
  const before = { count: null, mine: 0 }

  it('counts each Cloudflare IP separately', async () => {
    request.set('cf-connecting-ip', '203.0.113.1')
    expect(await likePost(before, form('newest'))).toEqual({ count: 1, mine: 1 })
    expect(await likePost(before, form('newest'))).toEqual({ count: 2, mine: 2 })
    expect(await getLikes('newest')).toEqual({ count: 2, mine: 2 })
    request.set('cf-connecting-ip', '203.0.113.2')
    expect(await getLikes('newest')).toEqual({ count: 2, mine: 0 })
  })

  it('falls back to the first forwarded IP, then to one shared visitor', async () => {
    request.set('x-forwarded-for', '198.51.100.1, 10.0.0.1')
    expect(await likePost(before, form('middle'))).toEqual({ count: 1, mine: 1 })
    request.delete('x-forwarded-for')
    expect(await likePost(before, form('middle'))).toEqual({ count: 2, mine: 1 })
    expect(await likePost(before, form('middle'))).toEqual({ count: 3, mine: 2 })
  })

  it('ignores a missing slug, an unknown one, and pages', async () => {
    for (const slug of [null, 'nope', index.pages[0]!.meta.slug]) {
      expect(await likePost(before, form(slug))).toBe(before)
    }
    expect(await getLikes('nope')).toEqual({ count: 0, mine: 0 })
  })
})
