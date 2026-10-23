import Link from 'next/link'

import styles from './not-found.module.css'

export default function NotFound() {
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
