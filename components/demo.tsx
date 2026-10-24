import { POST_DEMOS } from '@/.generated/demos'

import styles from './demo.module.css'

const NOTE_COLORS = ['accent', 'info', 'success'] as const

/**
 * One of a post's interactive demos, in a labeled frame. A name the post
 * doesn't list renders nothing. Without JavaScript the frame keeps any
 * pictures and says the controls need scripts. A pixel gamepad badge sits on
 * the frame's edge, and while a demo plays (any child with `data-playing`)
 * it hops and spits out notes.
 */
export function Demo({ name, slug }: { name: string; slug: string }) {
  const demos = POST_DEMOS[slug]
  const demo = demos && Object.hasOwn(demos, name) ? demos[name] : undefined
  if (!demo) return null
  const { title, Body } = demo
  return (
    <section aria-label={title} className={styles.demo}>
      <span aria-hidden="true" className={styles.badge}>
        <svg className={styles.gamepad} shapeRendering="crispEdges" viewBox="0 0 16 16">
          <path d="M2 4H14V5H15V11H14V12H10V11H6V12H2V11H1V5H2Z" />
          <path
            className={styles.hole}
            d="M4 6H5V7H6V8H5V9H4V8H3V7H4Z M10 7H11V8H10Z M12 6H13V7H12Z"
          />
        </svg>
        {NOTE_COLORS.map((color) => (
          <svg
            className={`${styles.note} ${styles[color]}`}
            key={color}
            shapeRendering="crispEdges"
            viewBox="0 0 8 8"
          >
            <path d="M4 0H7V1H8V3H7V2H5V6H4V8H1V7H0V6H1V5H4Z" />
          </svg>
        ))}
      </span>
      <p aria-hidden="true" className={styles.title}>
        {title}
      </p>
      <Body />
      <p className={styles.noscript}>Turn on JavaScript to play with this demo.</p>
    </section>
  )
}
