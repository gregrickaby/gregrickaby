import Logo from '@/app/icon.png'
import {Navigation} from '@/components/Navigation'
import config from '@/lib/config'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Header.module.css'

/**
 * Header component.
 */
export function Header() {
  return (
    <header className={styles.header} data-testid="header">
      <div className={styles.headerContainer}>
        <Link href="/">
          <Image
            alt="Greg Rickaby"
            className={styles.logo}
            height={96}
            loading="eager"
            src={Logo}
            width={96}
          />
        </Link>
        <div className={styles.brandingContainer}>
          <h1 className={styles.siteTitle}>
            <Link href="/">{config.siteName}</Link>
          </h1>
          <p className={styles.siteDescription}>{config.siteDescription}</p>
        </div>
      </div>
      <Navigation />
    </header>
  )
}
