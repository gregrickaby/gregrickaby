import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterAll, describe, expect, it, vi } from 'vitest'

// A database from before multiple likes: one row per visitor, no `times` column.
const dir = mkdtempSync(join(tmpdir(), 'likes-'))
const path = join(dir, 'likes.db')
const old = new DatabaseSync(path)
old.exec(`
  CREATE TABLE likes (
    slug TEXT NOT NULL,
    visitor TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (slug, visitor)
  ) WITHOUT ROWID;
  INSERT INTO likes (slug, visitor) VALUES ('post', 'a'), ('post', 'b');
`)
old.close()
vi.stubEnv('LIKES_DB_PATH', path)

const { addLike, countLikes } = await import('@/lib/likes')

afterAll(() => rmSync(dir, { force: true, recursive: true }))

describe('likes database from before multiple likes', () => {
  it('counts each existing like once, then lets visitors like again', () => {
    expect(countLikes('post')).toBe(2)
    expect(addLike('post', 'a')).toBe(2)
    expect(countLikes('post')).toBe(3)
  })
})
