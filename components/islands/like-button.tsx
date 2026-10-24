'use client'

import { useActionState, useEffect, useState, useSyncExternalStore } from 'react'

import { HeartIcon } from '@/components/icons'
import { getLikeCount, likePost } from '@/lib/like-post'

import styles from './like-button.module.css'
import { playSound } from './sounds'

function storageKey(slug: string) {
  return `liked:${slug}`
}

/** True when this browser liked the post before. Storage can throw in private windows. */
function hasLiked(slug: string): boolean {
  try {
    return localStorage.getItem(storageKey(slug)) === 'yes'
  } catch {
    return false
  }
}

/** Nothing else writes the flag while the page is open, so there's nothing to hear. */
function subscribe() {
  return () => {}
}

/**
 * A heart and a like count under a post. The form posts to a server action,
 * so liking works without JavaScript. With it, the count loads after
 * hydration, which keeps the post's HTML static. The server ignores repeat
 * likes; this browser remembers its own so the heart stays filled next time.
 */
export function LikeButton({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(likePost, { count: null, liked: false })
  const [loaded, setLoaded] = useState<number | null>(null)
  const remembered = useSyncExternalStore(
    subscribe,
    () => hasLiked(slug),
    () => false,
  )
  const liked = state.liked || remembered
  const count = state.count ?? loaded

  useEffect(() => {
    let current = true
    getLikeCount(slug).then(
      (value) => {
        if (current) setLoaded(value)
      },
      () => {
        // The heart still works; it just shows no count.
      },
    )
    return () => {
      current = false
    }
  }, [slug])

  // Remember the like only once the server has recorded it.
  useEffect(() => {
    if (!state.liked) return
    try {
      localStorage.setItem(storageKey(slug), 'yes')
    } catch {
      // The heart fills for this visit only.
    }
  }, [slug, state.liked])

  function onSubmit() {
    playSound('coin')
  }

  return (
    <form action={action} className={styles.form} onSubmit={onSubmit}>
      <input name="slug" type="hidden" value={slug} />
      <button
        className={liked ? `${styles.button} ${styles.liked}` : styles.button}
        data-boop="beat"
        disabled={liked || pending}
        type="submit"
      >
        <HeartIcon />
        {count === null ? null : <span>{count}</span>}
        <span className="visually-hidden">
          {count === null ? '' : count === 1 ? ' like. ' : ' likes. '}
          {liked ? 'You liked this post' : 'Like this post'}
        </span>
      </button>
    </form>
  )
}
