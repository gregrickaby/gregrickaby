'use server'

import { headers } from 'next/headers'

import { getPost } from './content'
import { addLike, countLikes, hashVisitor } from './likes'

/** What the like button shows. `count` is null until it loads. */
export interface LikeState {
  count: number | null
  liked: boolean
}

/**
 * A post's like count, which the button loads after the page hydrates. Post
 * pages stay fully static, so the count is never in their HTML. Slugs that
 * aren't posts count zero.
 */
export async function getLikeCount(slug: string): Promise<number> {
  return getPost(slug) ? countLikes(slug) : 0
}

/**
 * Likes a post once per visitor, keyed on a hash of the IP Cloudflare saw.
 * A form action, so it works without JavaScript: the response renders the
 * page with the new count. Slugs that aren't posts change nothing, and a
 * database error logs and leaves the button as it was.
 */
export async function likePost(previous: LikeState, formData: FormData): Promise<LikeState> {
  const slug = formData.get('slug')
  if (typeof slug !== 'string' || !getPost(slug)) return previous
  const request = await headers()
  const ip =
    request.get('cf-connecting-ip') ??
    request.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  try {
    addLike(slug, hashVisitor(ip))
    return { count: countLikes(slug), liked: true }
  } catch (error) {
    console.error('Could not save a like', error)
    return previous
  }
}
