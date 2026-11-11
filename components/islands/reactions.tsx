'use client'

import { useActionState, useEffect, useRef, useState, type CSSProperties } from 'react'

import { playSound } from '@/components/islands/audio/sounds'
import tooltip from '@/components/tooltip.module.css'
import { getReactions, reactToPost, type PostReactions } from '@/lib/react-to-post'
import { REACTIONS, type ReactionId } from '@/lib/site'

import styles from './reactions.module.css'

const SPARKLE_COUNT = 10
const SPARKLE_TONES = ['--tomato-2', '--tomato-3', '--tomato-4', '--tomato-5', '--tomato-6']

function between(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/**
 * Sparkles spaced around an emoji, each with its own tomato tone, reach,
 * flicker, and how far its hue drifts toward gold as it fades.
 */
function buildSparkles(): CSSProperties[] {
  return Array.from(
    { length: SPARKLE_COUNT },
    (_, index) =>
      ({
        '--angle': `${(360 / SPARKLE_COUNT) * index + between(-12, 12)}deg`,
        '--color': `var(${SPARKLE_TONES[index % SPARKLE_TONES.length]})`,
        '--distance': `${between(2.5, 4)}rem`,
        '--shift': `${between(20, 50)}deg`,
        '--size': `${between(4, 8)}px`,
        '--twinkle': `${between(120, 260)}ms`,
      }) as CSSProperties,
  )
}

/** A short count, such as 1.4K. */
function formatCount(count: number): string {
  return count.toLocaleString('en-US', { maximumFractionDigits: 1, notation: 'compact' })
}

/**
 * A post's reactions, in the toolbar after its body: four emoji, each with
 * its count in the corner. Each visitor gives a post one reaction: picking another
 * replaces it, and picking it again takes it back.
 *
 * The emoji are submit buttons in one form that posts to a server action, so
 * they work without JavaScript. With it, the counts load after hydration,
 * which keeps the post's HTML static. A reaction plays the coin sound, and
 * taking it back plays the close sound.
 *
 * A post can ask for a reaction with `<span data-like-cue></span>` in its
 * body. Once the reader has passed it and the reactions are on screen, they
 * hop and wave until the reader reacts. Readers who already reacted aren't asked.
 */
export function Reactions({ slug }: { slug: string }) {
  const [saved, action, pending] = useActionState(reactToPost, null)
  const [loaded, setLoaded] = useState<PostReactions | null>(null)
  const [burst, setBurst] = useState<{
    id: number
    reaction: ReactionId
    sparkles: CSSProperties[]
  } | null>(null)
  const [cue, setCue] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  // A saved reaction is newer than the counts loaded with the page.
  const current = saved ?? loaded
  const counts = current?.counts ?? null
  const mine = current?.mine ?? null
  const cued = cue && !mine

  useEffect(() => {
    let active = true
    getReactions(slug).then(
      (value) => {
        if (active) setLoaded(value)
      },
      () => {
        // The buttons still work; they just show no counts.
      },
    )
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    const form = formRef.current
    const marker = form?.closest('article')?.querySelector('[data-like-cue]')
    if (!form || !marker) return
    // The marker is usually far above the toolbar, so wait for both.
    const observer = new IntersectionObserver(() => {
      const reached = marker.getBoundingClientRect().top < window.innerHeight
      const { bottom, top } = form.getBoundingClientRect()
      if (reached && top < window.innerHeight && bottom > 0) {
        setCue(true)
        observer.disconnect()
      }
    })
    observer.observe(marker)
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  function onPick(reaction: ReactionId) {
    setCue(false)
    if (reaction === mine) {
      playSound('close')
      setBurst(null)
      return
    }
    playSound('coin')
    setBurst((previous) => ({
      id: (previous?.id ?? 0) + 1,
      reaction,
      sparkles: buildSparkles(),
    }))
  }

  return (
    <form
      action={action}
      aria-label="React to this post"
      className={styles.form}
      data-cue={cued || undefined}
      ref={formRef}
    >
      <input name="slug" type="hidden" value={slug} />
      {cued ? (
        <span aria-hidden="true" className={`${tooltip.bubble} ${styles.psst}`}>
          Psst!
        </span>
      ) : null}
      {REACTIONS.map((reaction) => {
        const count = counts?.[reaction.id] ?? 0
        return (
          <button
            aria-pressed={mine === reaction.id}
            className={`${tooltip.tip} ${styles.pick}`}
            data-tip={reaction.name}
            disabled={pending}
            key={reaction.id}
            name="reaction"
            onClick={() => onPick(reaction.id)}
            type="submit"
            value={reaction.id}
          >
            <span aria-hidden="true" className={styles.emoji}>
              {reaction.emoji}
            </span>
            <span className="visually-hidden">
              {count > 0 ? `${reaction.name}, ${count.toLocaleString('en-US')}` : reaction.name}
            </span>
            {count > 0 ? (
              <span aria-hidden="true" className={styles.count}>
                {formatCount(count)}
              </span>
            ) : null}
            {burst?.reaction === reaction.id ? (
              <span aria-hidden="true" className={styles.burst} key={burst.id}>
                {burst.sparkles.map((style, index) => (
                  <span className={styles.sparkle} key={index} style={style} />
                ))}
              </span>
            ) : null}
          </button>
        )
      })}
    </form>
  )
}
