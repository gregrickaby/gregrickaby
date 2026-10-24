import { POST_DEMOS } from '@/.generated/demos'

import styles from './demo.module.css'

/**
 * One of a post's interactive demos, in a labeled frame. A name the post
 * doesn't list renders nothing. Without JavaScript the frame keeps any
 * pictures and says the controls need scripts.
 */
export function Demo({ name, slug }: { name: string; slug: string }) {
  const demos = POST_DEMOS[slug]
  const demo = demos && Object.hasOwn(demos, name) ? demos[name] : undefined
  if (!demo) return null
  const { title, Body } = demo
  return (
    <section aria-label={title} className={styles.demo}>
      <p aria-hidden="true" className={styles.title}>
        {title}
      </p>
      <Body />
      <p className={styles.noscript}>Turn on JavaScript to play with this demo.</p>
    </section>
  )
}
