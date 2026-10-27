import 'server-only'

import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import { logger } from './datadog/server'
import { MAX_LIKES } from './site'

/**
 * Where the likes live. In production this is a file on a Coolify volume, so
 * it survives deploys.
 */
const DB_PATH = process.env.LIKES_DB_PATH || '.data/likes.db'

let db: DatabaseSync | undefined
let warnedAboutSalt = false

/**
 * Says so once when production has no salt. A missing environment variable
 * weakens every hash, but it should not take the site down.
 */
function warnIfUnsalted(): void {
  if (warnedAboutSalt || process.env.NODE_ENV !== 'production' || process.env.LIKES_SALT) return
  warnedAboutSalt = true
  logger.warn('LIKES_SALT is not set: visitor hashes are unsalted. Set it in production.')
}

/**
 * Opens the database on first use. One row per visitor per post, with how
 * many times that visitor liked it. Databases from before multiple likes get
 * the `times` column, so their existing likes count once.
 */
function getDb(): DatabaseSync {
  warnIfUnsalted()
  if (db) return db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS likes (
      slug TEXT NOT NULL,
      visitor TEXT NOT NULL,
      times INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (slug, visitor)
    ) WITHOUT ROWID;
  `)
  const columns = db.prepare('PRAGMA table_info(likes)').all() as { name: string }[]
  if (!columns.some((column) => column.name === 'times')) {
    db.exec('ALTER TABLE likes ADD COLUMN times INTEGER NOT NULL DEFAULT 1')
  }
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

/** A post's like count, across every visitor. */
export function countLikes(slug: string): number {
  const row = getDb()
    .prepare('SELECT COALESCE(SUM(times), 0) AS count FROM likes WHERE slug = ?')
    .get(slug) as { count: number }
  return row.count
}

/** How many times one visitor liked a post. */
export function countVisitorLikes(slug: string, visitor: string): number {
  const row = getDb()
    .prepare('SELECT times FROM likes WHERE slug = ? AND visitor = ?')
    .get(slug, visitor) as { times: number } | undefined
  return row?.times ?? 0
}

/**
 * Records a like, up to `MAX_LIKES` per visitor; likes past that change
 * nothing. Returns how many times this visitor has liked the post.
 */
export function addLike(slug: string, visitor: string): number {
  getDb()
    .prepare(
      `INSERT INTO likes (slug, visitor) VALUES (?, ?)
       ON CONFLICT (slug, visitor) DO UPDATE SET times = times + 1 WHERE times < ?`,
    )
    .run(slug, visitor, MAX_LIKES)
  return countVisitorLikes(slug, visitor)
}
