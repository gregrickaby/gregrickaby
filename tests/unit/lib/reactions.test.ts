import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isReactionId } from '@/lib/site'
import { contentIndex } from '@/tests/helpers/content'

const index = contentIndex()
vi.mock('@/.generated/content.json', () => ({ default: index }))

const request = new Headers()
vi.mock('next/headers', () => ({ headers: async () => request }))

vi.stubEnv('LIKES_DB_PATH', ':memory:')
vi.stubEnv('LIKES_SALT', 'pepper')

const { countReactions, getVisitorReaction, hashVisitor, toggleReaction } =
  await import('@/lib/reactions')
const { getReactions, reactToPost } = await import('@/lib/react-to-post')

const ZERO = { fire: 0, heart: 0, laugh: 0, wow: 0 }

function form(slug: string | null, reaction: string | null = 'heart') {
  const data = new FormData()
  if (slug !== null) data.set('slug', slug)
  if (reaction !== null) data.set('reaction', reaction)
  return data
}

beforeEach(() => {
  // oxlint-disable-next-line unicorn/no-useless-spread -- deleting while iterating Headers skips entries.
  for (const name of [...request.keys()]) request.delete(name)
})

describe('reactions store', () => {
  it('keeps one reaction per visitor per post, swapping or taking it back', () => {
    expect(toggleReaction('store', 'a', 'heart')).toBe('heart')
    expect(toggleReaction('store', 'b', 'heart')).toBe('heart')
    expect(countReactions('store')).toEqual({ ...ZERO, heart: 2 })
    expect(toggleReaction('store', 'a', 'fire')).toBe('fire')
    expect(countReactions('store')).toEqual({ ...ZERO, fire: 1, heart: 1 })
    expect(getVisitorReaction('store', 'a')).toBe('fire')
    expect(toggleReaction('store', 'a', 'fire')).toBeNull()
    expect(getVisitorReaction('store', 'a')).toBeNull()
    expect(countReactions('store')).toEqual({ ...ZERO, heart: 1 })
    expect(countReactions('nothing')).toEqual(ZERO)
  })

  it('skips reactions the site no longer has', () => {
    toggleReaction('retired', 'a', 'eyes' as never)
    toggleReaction('retired', 'b', 'fire')
    expect(countReactions('retired')).toEqual({ ...ZERO, fire: 1 })
    expect(getVisitorReaction('retired', 'a')).toBeNull()
    expect(toggleReaction('retired', 'a', 'wow')).toBe('wow')
    expect(countReactions('retired')).toEqual({ ...ZERO, fire: 1, wow: 1 })
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

  it('knows only its own reactions', () => {
    expect(isReactionId('wow')).toBe(true)
    expect(isReactionId('thumbs-down')).toBe(false)
    expect(isReactionId(null)).toBe(false)
  })
})

describe('reactToPost', () => {
  const before = null

  it('counts each Cloudflare IP separately', async () => {
    request.set('cf-connecting-ip', '203.0.113.1')
    expect(await reactToPost(before, form('newest'))).toEqual({
      counts: { ...ZERO, heart: 1 },
      mine: 'heart',
    })
    expect(await reactToPost(before, form('newest', 'wow'))).toEqual({
      counts: { ...ZERO, wow: 1 },
      mine: 'wow',
    })
    request.set('cf-connecting-ip', '203.0.113.2')
    expect(await getReactions('newest')).toEqual({ counts: { ...ZERO, wow: 1 }, mine: null })
    expect(await reactToPost(before, form('newest', 'wow'))).toEqual({
      counts: { ...ZERO, wow: 2 },
      mine: 'wow',
    })
    expect(await reactToPost(before, form('newest', 'wow'))).toEqual({
      counts: { ...ZERO, wow: 1 },
      mine: null,
    })
  })

  it('falls back to the first forwarded IP, then to one shared visitor', async () => {
    request.set('x-forwarded-for', '198.51.100.1, 10.0.0.1')
    expect(await reactToPost(before, form('middle'))).toEqual({
      counts: { ...ZERO, heart: 1 },
      mine: 'heart',
    })
    request.delete('x-forwarded-for')
    expect(await reactToPost(before, form('middle'))).toEqual({
      counts: { ...ZERO, heart: 2 },
      mine: 'heart',
    })
    expect(await getReactions('middle')).toEqual({ counts: { ...ZERO, heart: 2 }, mine: 'heart' })
  })

  it('ignores a missing slug, an unknown one, pages, and unknown reactions', async () => {
    for (const slug of [null, 'nope', index.pages[0]!.meta.slug]) {
      expect(await reactToPost(before, form(slug))).toBe(before)
    }
    for (const reaction of [null, 'thumbs-down']) {
      expect(await reactToPost(before, form('oldest', reaction))).toBe(before)
    }
    expect(await getReactions('nope')).toEqual({ counts: ZERO, mine: null })
  })
})
