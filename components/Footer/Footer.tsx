import {SocialLinks} from '@/components/SocialLinks/SocialLinks'
import styles from './Footer.module.css'

/**
 * Footer component.
 */
export function Footer() {
  return (
    <footer className={styles.footer} data-testid="footer">
      <SocialLinks />

      <p>© 1997-{new Date().getFullYear()} Greg Rickaby</p>
      <p>
        Unless otherwise noted, all photos and content are licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-NC-ND 4.0
        </a>
      </p>
    </footer>
  )
}
