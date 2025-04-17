import styles from './HomePage.module.css'

/**
 * The homepage component.
 */
export async function HomePage() {
  return (
    <article className={styles.homePage}>
      <h1 className={styles.title}>
        <span aria-hidden="true" className={styles.wave}>
          👋
        </span>{' '}
        Hello there!
      </h1>
      <p className={styles.intro}>
        I&apos;m a Tech Lead at{' '}
        <a
          href="https://mindsize.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mindsize
        </a>
        ,{' '}
        <a href="https://www.amazon.com/author/gregrickaby" rel="author">
          published author
        </a>
        , and proud survivor of the{' '}
        <a href="https://gregrickaby.com/geocities">Geocities era</a>.{' '}
        <span className="hidden md:inline">
          Outside of work, you&apos;ll find me{' '}
          <a href="https://flickr.com/people/gregrickaby/" rel="author">
            behind a camera
          </a>
          , tossing pizzas, or planning the next family road trip.
        </span>
      </p>
    </article>
  )
}
