import {SocialLinks} from '@/components/SocialLinks'
import styles from './Footer.module.css'

/**
 * Footer component.
 */
export function Footer() {
  return (
    <footer className={styles.footer} data-testid="footer">
      <SocialLinks />

      <p>
        Unless otherwise noted, all content on this website is licensed under{' '}
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
          CC BY-NC-ND 4.0
        </a>
        .
      </p>

      <p>&copy; 2008 - {new Date().getFullYear()} Greg Rickaby ✌️</p>
    </footer>
  )
}
