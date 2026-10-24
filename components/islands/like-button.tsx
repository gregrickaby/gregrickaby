'use client'

import { useActionState, useEffect, useRef, useState, type CSSProperties } from 'react'

import { HeartIcon } from '@/components/icons'
import { getLikes, likePost } from '@/lib/like-post'
import { MAX_LIKES } from '@/lib/site'

import styles from './like-button.module.css'
import { playSound } from './sounds'

const SPARKLE_COUNT = 10
const SPARKLE_TONES = ['--tomato-2', '--tomato-3', '--tomato-4', '--tomato-5', '--tomato-6']

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

/** The button's label after the count, for screen readers. */
function getLabel(mine: number): string {
  if (mine === 0) return 'Like this post'
  if (mine < MAX_LIKES) return `Like this post again (${mine} of ${MAX_LIKES})`
  return `You liked this post ${MAX_LIKES} times`
}

/** The hover tooltip, in Super Mario Bros. terms. Screen readers get {@link getLabel}. */
function getTip(mine: number): string {
  if (mine === 0) return 'Hit the ? block!'
  if (mine < MAX_LIKES) return `x${mine} coins! Hit it again`
  return 'Course clear!'
}

/**
 * A heart and a like count beside a post. The form posts to a server action,
 * so liking works without JavaScript. With it, the count loads after
 * hydration, which keeps the post's HTML static. A visitor can like a post up
 * to `MAX_LIKES` times, and the heart fills from the bottom as they do. The
 * last like plays a fanfare.
 *
 * A post can ask for a like with `<span data-like-cue></span>` in its body.
 * Once the reader reaches it and the button is on screen, the button hops and
 * waves until it's liked. Readers who already liked the post aren't asked.
 */
export function LikeButton({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(likePost, { count: null, mine: 0 })
  const [loaded, setLoaded] = useState<{ count: number; mine: number } | null>(null)
  const [burst, setBurst] = useState<{ id: number; sparkles: CSSProperties[] } | null>(null)
  const [cue, setCue] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  // Once a like lands, the action's answer is newer than the loaded one.
  const current = state.count === null ? loaded : state
  const count = current?.count ?? null
  const mine = current?.mine ?? 0
  const full = mine >= MAX_LIKES

  useEffect(() => {
    let active = true
    getLikes(slug).then(
      (value) => {
        if (active) setLoaded(value)
      },
      () => {
        // The heart still works; it just shows no count.
      },
    )
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    const button = ref.current
    const marker = button?.closest('article')?.querySelector('[data-like-cue]')
    if (!button || !marker) return
    // On narrow screens the button sits after the body, so it waits to be seen too.
    const observer = new IntersectionObserver(() => {
      const reached = marker.getBoundingClientRect().top < window.innerHeight
      const { bottom, height, top } = button.getBoundingClientRect()
      if (reached && height > 0 && top < window.innerHeight && bottom > 0) {
        setCue(true)
        observer.disconnect()
      }
    })
    observer.observe(marker)
    observer.observe(button)
    return () => observer.disconnect()
  }, [])

  function onSubmit() {
    setCue(false)
    playSound(mine === MAX_LIKES - 1 ? 'fanfare' : 'coin')
    setBurst((previous) => ({ id: (previous?.id ?? 0) + 1, sparkles: buildSparkles() }))
  }

  return (
    <form action={action} className={styles.form} onSubmit={onSubmit}>
      <input name="slug" type="hidden" value={slug} />
      <button
        className={mine > 0 ? `${styles.button} ${styles.liked}` : styles.button}
        data-boop="beat"
        data-cue={(cue && mine === 0) || undefined}
        data-tip={getTip(mine)}
        disabled={full || pending}
        ref={ref}
        type="submit"
      >
        {cue && mine === 0 ? (
          <span aria-hidden="true" className={styles.psst}>
            Psst!
          </span>
        ) : null}
        <span className={styles.heart} style={{ '--fill': mine / MAX_LIKES } as CSSProperties}>
          <HeartIcon size={24} />
          <HeartIcon className={styles.fill} size={24} />
          {burst ? (
            <span aria-hidden="true" className={styles.burst} key={burst.id}>
              {burst.sparkles.map((style, index) => (
                <span className={styles.sparkle} key={index} style={style} />
              ))}
            </span>
          ) : null}
        </span>
        {count === null ? null : (
          <span className={styles.count}>{count.toLocaleString('en-US')}</span>
        )}
        <span className="visually-hidden">
          {count === null ? '' : count === 1 ? ' like. ' : ' likes. '}
          {getLabel(mine)}
        </span>
      </button>
    </form>
  )
}
