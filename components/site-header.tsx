import Image from 'next/image'
import Link from 'next/link'
import { MobileMenu } from '@/components/islands/mobile-menu'
import { SoundNav } from '@/components/islands/sound-nav'
import { SoundToggle } from '@/components/islands/sound-toggle'
import { ThemeToggle } from '@/components/islands/theme-toggle'
import { NavLinks } from '@/components/nav-links'
import { SearchForm } from '@/components/search-form'
import { SITE } from '@/lib/site'
import styles from './site-header.module.css'

/** The sticky site header. Server-rendered; the toggles, the mobile menu, and the nav's hover sounds hydrate. */
export function SiteHeader() {
  return (
    <header className={`no-print ${styles.header}`}>
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

        <SoundNav aria-label="Main" className={styles.nav}>
          <NavLinks className={styles.link} />
        </SoundNav>

        <div className={styles.actions}>
          <div className={styles.search}>
            <SearchForm id="header-search" />
          </div>
          <SoundToggle />
          <ThemeToggle />
          <div className={styles.menu}>
            <MobileMenu>
              <SoundNav aria-label="Main" className={styles.menuNav}>
                <NavLinks className={styles.link} />
              </SoundNav>
              <SearchForm id="menu-search" />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
