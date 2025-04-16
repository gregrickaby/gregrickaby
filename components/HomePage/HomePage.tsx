import styles from './HomePage.module.css'

/**
 * The homepage component.
 */
export async function HomePage() {
  return (
    <article className={styles.homePage}>
      <h1 className={styles.title}>👋 Hello there!</h1>
      <p className={styles.intro}>
        I&apos;m a{' '}
        <a
          aria-label="view my photos"
          href="https://flickr.com/photos/gregrickaby"
          rel="author"
        >
          photographer
        </a>
        ,{' '}
        <a
          aria-label="follow on LinkedIn"
          href="https://www.linkedin.com/in/gregrickaby/"
          rel="author"
        >
          web developer
        </a>
        , and{' '}
        <a
          aria-label="view my amazon author profile"
          href="https://www.amazon.com/author/gregrickaby"
          rel="author"
        >
          published author
        </a>
        . Working as Tech Lead at{' '}
        <a href="https://mindsize.com" rel="nofollow">
          Mindsize
        </a>
        .
      </p>
    </article>
  )
}
