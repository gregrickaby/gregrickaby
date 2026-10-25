import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'

let warn: MockInstance<typeof console.warn>

async function countLikes(): Promise<number> {
  const { countLikes } = await import('@/lib/likes')
  return countLikes('post')
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('LIKES_DB_PATH', ':memory:')
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('likes salt warning', () => {
  it('warns once in production without a salt', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('LIKES_SALT', undefined)
    expect(await countLikes()).toBe(0)
    expect(await countLikes()).toBe(0)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      'LIKES_SALT is not set: visitor hashes are unsalted. Set it in production.',
    )
  })

  it('stays quiet in development without a salt', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('LIKES_SALT', undefined)
    expect(await countLikes()).toBe(0)
    expect(warn).not.toHaveBeenCalled()
  })

  it('stays quiet in production with a salt', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('LIKES_SALT', 'pepper')
    expect(await countLikes()).toBe(0)
    expect(warn).not.toHaveBeenCalled()
  })
})
