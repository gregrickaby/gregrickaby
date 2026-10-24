'use client'

import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react'

import { HeartIcon } from '@/components/icons'
import { getLikeCount, likePost } from '@/lib/like-post'

import styles from './like-button.module.css'
import { playSound } from './sounds'

const SPARKLE_COUNT = 10
const SPARKLE_TONES = ['--tomato-2', '--tomato-3', '--tomato-4', '--tomato-5', '--tomato-6']

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

function between(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/**
 * Sparkles spaced around the heart, each with its own tomato tone, reach,
 * flicker, and how far its hue drifts toward gold as it fades.
 */
function buildSparkles(): CSSProperties[] {
  return Array.from(
    { length: SPARKLE_COUNT },
    (_, index) =>
      ({
        '--angle': `${(360 / SPARKLE_COUNT) * index + between(-12, 12)}deg`,
        '--color': `var(${SPARKLE_TONES[index % SPARKLE_TONES.length]})`,
        '--distance': `${between(1.5, 2.5)}rem`,
        '--shift': `${between(20, 50)}deg`,
        '--size': `${between(4, 8)}px`,
        '--twinkle': `${between(120, 260)}ms`,
      }) as CSSProperties,
  )
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
  const [burst, setBurst] = useState<{ id: number; sparkles: CSSProperties[] } | null>(null)
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
    setBurst((previous) => ({ id: (previous?.id ?? 0) + 1, sparkles: buildSparkles() }))
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
        <span className={styles.heart}>
          <HeartIcon />
          {burst ? (
            <span aria-hidden="true" className={styles.burst} key={burst.id}>
              {burst.sparkles.map((style, index) => (
                <span className={styles.sparkle} key={index} style={style} />
              ))}
            </span>
          ) : null}
        </span>
        {count === null ? null : <span>{count}</span>}
        <span className="visually-hidden">
          {count === null ? '' : count === 1 ? ' like. ' : ' likes. '}
          {liked ? 'You liked this post' : 'Like this post'}
        </span>
      </button>
    </form>
  )
}
