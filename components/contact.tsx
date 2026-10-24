import { SoundNav } from '@/components/islands/sound-nav'
import { SITE } from '@/lib/site'

import styles from './contact.module.css'

/** How to reach Greg: email first, then profiles. */
export function Contact() {
  return (
    <section className={styles.contact}>
      <p>Email is the best way to reach me.</p>
      <SoundNav as="ul" className={styles.links} clickSound="select" role="list">
        <li>
          <a className={`${styles.link} ${styles.primary}`} href={`mailto:${SITE.author.email}`}>
            {SITE.author.email}
          </a>
        </li>
        <li>
          <a className={styles.link} href={SITE.author.linkedin} rel="me noopener" target="_blank">
            LinkedIn
          </a>
        </li>
        <li>
          <a className={styles.link} href={SITE.author.github} rel="me noopener" target="_blank">
            GitHub
          </a>
        </li>
      </SoundNav>
    </section>
  )
}
