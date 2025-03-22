import Logo from '@/app/icon.png'
import {Navigation} from '@/components/Navigation/Navigation'
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
            height={80}
            loading="eager"
            src={Logo}
            width={80}
          />
        </Link>
        <div className={styles.brandingContainer}>
          <h1 className={styles.siteTitle}>
            <Link href="/">{config.siteName}</Link>
          </h1>
          <p className="sr-only">{config.siteDescription}</p>
        </div>
      </div>
      <Navigation />
    </header>
  )
}
