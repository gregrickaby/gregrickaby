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
      <section className={styles.bio}>
        <p>
          I&apos;m a Tech Lead at Mindsize, photographer, published author and
          proud survivor of the Geocities era. Outside of work, you&apos;ll find
          me behind a camera, tossing pizzas, or planning the next family road
          trip to Disney World.
        </p>
      </section>
    </article>
  )
}
