import 'server-only'

import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

/**
 * Where the likes live. In production this is a file on a Coolify volume, so
 * it survives deploys.
 */
const DB_PATH = process.env.LIKES_DB_PATH || '.data/likes.db'

let db: DatabaseSync | undefined

/**
 * Opens the database on first use. One row per visitor per post, so a count
 * is a row count and a repeat like is a no-op.
 */
function getDb(): DatabaseSync {
  if (db) return db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS likes (
      slug TEXT NOT NULL,
      visitor TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (slug, visitor)
    ) WITHOUT ROWID;
  `)
  return db
}

/**
 * A visitor's IP, salted and hashed, so the table never holds an address.
 * Set `LIKES_SALT` in production: unsalted IPv4 hashes can be reversed.
 */
export function hashVisitor(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.LIKES_SALT ?? ''}:${ip}`)
    .digest('hex')
}

/** A post's like count. */
export function countLikes(slug: string): number {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM likes WHERE slug = ?').get(slug) as {
    count: number
  }
  return row.count
}

/** Records a like. Returns false when this visitor already liked the post. */
export function addLike(slug: string, visitor: string): boolean {
  const result = getDb()
    .prepare('INSERT OR IGNORE INTO likes (slug, visitor) VALUES (?, ?)')
    .run(slug, visitor)
  return result.changes > 0
}
