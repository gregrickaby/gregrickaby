import styles from './HomePage.module.css'

/**
 * The homepage component.
 */
export async function HomePage() {
  return (
    <article className={styles.homePage}>
      <h1 className={styles.title}>👋 Hello there!</h1>
      <p className={styles.intro}>
        I’m a Tech Lead at{' '}
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
        <a href="https://gregrickaby.com/geocities">Geocities era</a>. Outside
        of work, you’ll find me{' '}
        <a href="https://flickr.com/people/gregrickaby/" rel="author">
          behind a camera
        </a>
        , tossing pizzas, or planning the next family road trip.
      </p>
    </article>
  )
}
