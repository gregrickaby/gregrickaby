import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

const dir = mkdtempSync(join(tmpdir(), 'reactions-'))

/** A database file with a `likes` table from before reactions. */
function seed(name: string, sql: string): string {
  const path = join(dir, name)
  const old = new DatabaseSync(path)
  old.exec(sql)
  old.close()
  return path
}

async function open(path: string) {
  vi.resetModules()
  vi.stubEnv('LIKES_DB_PATH', path)
  return import('@/lib/reactions')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

afterAll(() => rmSync(dir, { force: true, recursive: true }))

describe('likes database from before reactions', () => {
  it("turns each visitor's likes into one heart and drops the old table", async () => {
    const path = seed(
      'multiple.db',
      `CREATE TABLE likes (
        slug TEXT NOT NULL,
        visitor TEXT NOT NULL,
        times INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (slug, visitor)
      ) WITHOUT ROWID;
      INSERT INTO likes (slug, visitor, times) VALUES ('post', 'a', 7), ('post', 'b', 1);`,
    )
    const { countReactions, getVisitorReaction, toggleReaction } = await open(path)
    expect(countReactions('post').heart).toBe(2)
    expect(getVisitorReaction('post', 'a')).toBe('heart')
    toggleReaction('post', 'a', 'laugh')
    expect(countReactions('post')).toMatchObject({ heart: 1, laugh: 1 })
    const check = new DatabaseSync(path)
    expect(check.prepare("SELECT name FROM sqlite_master WHERE name = 'likes'").all()).toEqual([])
    check.close()
  })

  it('opens a database that already has reactions', async () => {
    const path = seed('fresh.db', 'SELECT 1;')
    const first = await open(path)
    first.toggleReaction('post', 'a', 'fire')
    const second = await open(path)
    expect(second.countReactions('post').fire).toBe(1)
  })
})
