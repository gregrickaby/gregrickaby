import 'server-only'

import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import { logger } from './datadog/server'
import { buildEmptyCounts, isReactionId, type ReactionId } from './site'

/**
 * Where the reactions live. In production this is a file on a Coolify volume,
 * so it survives deploys. The variable keeps its name from when posts had likes.
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
 * Moves a `likes` table from before reactions into `reactions` as hearts, one
 * per visitor (a visitor could like a post up to ten times; a reaction counts
 * once), then drops it.
 */
function migrateLikes(database: DatabaseSync): void {
  const columns = database.prepare('PRAGMA table_info(likes)').all()
  if (columns.length === 0) return
  database.exec(`
    BEGIN;
    INSERT OR IGNORE INTO reactions (slug, visitor, reaction, created_at)
      SELECT slug, visitor, 'heart', created_at FROM likes;
    DROP TABLE likes;
    COMMIT;
  `)
}

/** Opens the database on first use. One row per visitor per post: their reaction. */
function getDb(): DatabaseSync {
  warnIfUnsalted()
  if (db) return db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS reactions (
      slug TEXT NOT NULL,
      visitor TEXT NOT NULL,
      reaction TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (slug, visitor)
    ) WITHOUT ROWID;
  `)
  migrateLikes(db)
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

/**
 * How many visitors gave a post each reaction. Rows for a reaction the site
 * no longer has stay in the table but don't count.
 */
export function countReactions(slug: string): Record<ReactionId, number> {
  const rows = getDb()
    .prepare('SELECT reaction, COUNT(*) AS count FROM reactions WHERE slug = ? GROUP BY reaction')
    .all(slug) as { count: number; reaction: string }[]
  const counts = buildEmptyCounts()
  for (const { count, reaction } of rows) if (isReactionId(reaction)) counts[reaction] = count
  return counts
}

/** The reaction one visitor gave a post, if the site still has it. */
export function getVisitorReaction(slug: string, visitor: string): ReactionId | null {
  const row = getDb()
    .prepare('SELECT reaction FROM reactions WHERE slug = ? AND visitor = ?')
    .get(slug, visitor) as { reaction: string } | undefined
  return isReactionId(row?.reaction) ? row.reaction : null
}

/**
 * Gives a post a visitor's reaction, replacing the one they gave before.
 * Giving the same reaction again takes it back. Returns the visitor's reaction
 * after the change.
 */
export function toggleReaction(
  slug: string,
  visitor: string,
  reaction: ReactionId,
): ReactionId | null {
  const database = getDb()
  if (getVisitorReaction(slug, visitor) === reaction) {
    database.prepare('DELETE FROM reactions WHERE slug = ? AND visitor = ?').run(slug, visitor)
    return null
  }
  database
    .prepare(
      `INSERT INTO reactions (slug, visitor, reaction) VALUES (?, ?, ?)
       ON CONFLICT (slug, visitor) DO UPDATE SET reaction = excluded.reaction`,
    )
    .run(slug, visitor, reaction)
  return reaction
}
