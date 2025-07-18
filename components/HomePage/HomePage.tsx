import Link from 'next/link'
import styles from './HomePage.module.css'

/**
 * The homepage component.
 */
export async function HomePage({bio}: Readonly<{bio: string}>) {
  return (
    <article className={styles.homePage}>
      <h1 className={styles.title}>
        <span aria-hidden="true" className={styles.wave}>
          👋
        </span>{' '}
        Hello there!
      </h1>
      <section className={styles.bio} dangerouslySetInnerHTML={{__html: bio}} />
      <Link href="/blog" className={styles.button}>
        Read my blog
      </Link>
    </article>
  )
}
