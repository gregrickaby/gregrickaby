import { ArrowUpIcon } from '@/components/icons'
import { getBuildTime } from '@/lib/content'
import { SITE } from '@/lib/site'
import styles from './site-footer.module.css'

/** Copyright, license, and profile links, plus a back-to-top link. */
export function SiteFooter() {
  // The build time, not the request time, so the footer stays static.
  const year = new Date(getBuildTime()).getUTCFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.legal}>
          <p>
            &copy; {`1981-${year}`} {SITE.name}
          </p>
          <p>
            Unless otherwise noted, all photos and content are licensed under{' '}
            <a href={SITE.license.url} rel="license noopener" target="_blank">
              {SITE.license.name}
            </a>
            .
          </p>
        </div>
        <ul className={styles.social} role="list">
          <li>
            <a href={SITE.author.github} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a href={SITE.author.linkedin} rel="me noopener" target="_blank">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <a aria-label="Back to top" className={styles.top} href="#top">
        <ArrowUpIcon />
      </a>
    </footer>
  )
}
