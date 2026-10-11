import Image from 'next/image'
import Link from 'next/link'
import { MobileMenu } from '@/components/islands/mobile-menu'
import { ThemeToggle } from '@/components/islands/theme-toggle'
import { NavLinks } from '@/components/nav-links'
import { SearchForm } from '@/components/search-form'
import { SITE } from '@/lib/site'
import styles from './site-header.module.css'

/** The sticky site header. Server-rendered; only the theme toggle and mobile menu hydrate. */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <Image
            alt=""
            className={styles.avatar}
            height={40}
            preload
            src="/avatar.jpg"
            width={40}
          />
          <span className={styles.name}>{SITE.name}</span>
          <span className="visually-hidden">: {SITE.description}</span>
        </Link>

        <nav aria-label="Main" className={styles.nav}>
          <NavLinks className={styles.link} />
        </nav>

        <div className={styles.actions}>
          <div className={styles.search}>
            <SearchForm id="header-search" />
          </div>
          <ThemeToggle />
          <div className={styles.menu}>
            <MobileMenu>
              <nav aria-label="Main" className={styles.menuNav}>
                <NavLinks className={styles.link} />
              </nav>
              <SearchForm id="menu-search" />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
