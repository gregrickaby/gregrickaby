'use server'

import { headers } from 'next/headers'

import { getPost } from './content'
import { errorFields, logger } from './datadog/server'
import { countReactions, getVisitorReaction, hashVisitor, toggleReaction } from './reactions'
import { buildEmptyCounts, isReactionId, type ReactionId } from './site'

/** A post's count for each reaction, and the one this visitor gave. */
export interface PostReactions {
  counts: Record<ReactionId, number>
  mine: ReactionId | null
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
 * A post's reaction counts and this visitor's reaction, which the buttons
 * load after the page hydrates. Post pages stay fully static, so neither is
 * in their HTML. Slugs that aren't posts count zero.
 */
export async function getReactions(slug: string): Promise<PostReactions> {
  if (!getPost(slug)) return { counts: buildEmptyCounts(), mine: null }
  const visitor = await getVisitor()
  return { counts: countReactions(slug), mine: getVisitorReaction(slug, visitor) }
}

/**
 * Gives a post the clicked button's reaction, keyed on a hash of the IP
 * Cloudflare saw. One reaction per visitor: a new one replaces the old, and
 * the same one again takes it back. A form action, so it works without
 * JavaScript: the response renders the page with the new counts. Unknown
 * slugs, pages, and unknown reactions change nothing, and a database error
 * logs and leaves the buttons as they were. `null` is the state before any
 * reaction, while the buttons show the counts they loaded.
 */
export async function reactToPost(
  previous: PostReactions | null,
  formData: FormData,
): Promise<PostReactions | null> {
  const slug = formData.get('slug')
  const reaction = formData.get('reaction')
  if (typeof slug !== 'string' || !getPost(slug) || !isReactionId(reaction)) return previous
  const visitor = await getVisitor()
  try {
    const mine = toggleReaction(slug, visitor, reaction)
    return { counts: countReactions(slug), mine }
  } catch (error) {
    logger.error('Could not save a reaction', errorFields(error))
    return previous
  }
}
