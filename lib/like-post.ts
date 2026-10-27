'use server'

import { headers } from 'next/headers'

import { getPost } from './content'
import { errorFields, logger } from './datadog/server'
import { addLike, countLikes, countVisitorLikes, hashVisitor } from './likes'

/** What the like button shows. `count` is null until it loads. */
export interface LikeState {
  count: number | null
  /** How many times this visitor liked the post. */
  mine: number
}

/** The hashed IP Cloudflare saw, or one shared visitor when there's none. */
async function getVisitor(): Promise<string> {
  const request = await headers()
  const ip =
    request.get('cf-connecting-ip') ??
    request.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  return hashVisitor(ip)
}

/**
 * A post's like count and this visitor's share of it, which the button loads
 * after the page hydrates. Post pages stay fully static, so neither is in
 * their HTML. Slugs that aren't posts count zero.
 */
export async function getLikes(slug: string): Promise<{ count: number; mine: number }> {
  if (!getPost(slug)) return { count: 0, mine: 0 }
  return { count: countLikes(slug), mine: countVisitorLikes(slug, await getVisitor()) }
}

/**
 * Likes a post, up to `MAX_LIKES` times per visitor, keyed on a hash of the
 * IP Cloudflare saw. A form action, so it works without JavaScript: the
 * response renders the page with the new count. Slugs that aren't posts
 * change nothing, and a database error logs and leaves the button as it was.
 */
export async function likePost(previous: LikeState, formData: FormData): Promise<LikeState> {
  const slug = formData.get('slug')
  if (typeof slug !== 'string' || !getPost(slug)) return previous
  const visitor = await getVisitor()
  try {
    const mine = addLike(slug, visitor)
    return { count: countLikes(slug), mine }
  } catch (error) {
    logger.error('Could not save a like', errorFields(error))
    return previous
  }
}
