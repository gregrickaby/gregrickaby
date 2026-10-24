import Link from 'next/link'

import styles from './missing-page.module.css'

/** The 404 message, with links home and to search. */
export function MissingPage() {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.title}>404</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <p>
        <Link href="/">Go back home</Link> or <Link href="/search">search the blog</Link>.
      </p>
    </div>
  )
}
