'use client'

import {AppLink} from '@/components/AppLink/AppLink'
import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {MobileDrawer} from '@/components/MobileDrawer/MobileDrawer'
import {NavLinks} from '@/components/NavLinks/NavLinks'
import {SearchButton} from '@/components/Search/Search'
import {siteConfig} from '@/lib/config'
import {Burger, Title, VisuallyHidden} from '@mantine/core'
import {useDisclosure, useWindowScroll} from '@mantine/hooks'
import Image from 'next/image'
import styles from './Header.module.css'

export function Header() {
  const [opened, {toggle, close}] = useDisclosure(false)
  const [{y}] = useWindowScroll()
  const scrolled = y > 50

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <AppLink href="/">
            <div className={styles.logo}>
              <Image
                alt={siteConfig.name}
                height={40}
                priority
                src="/avatar.jpg"
                width={40}
                className={styles.avatar}
              />
              <Title order={1} size="h3" className={styles.title}>
                {siteConfig.name}
              </Title>
              <VisuallyHidden>{siteConfig.description}</VisuallyHidden>
            </div>
          </AppLink>

          <div className={styles.nav}>
            <NavLinks />
          </div>

          <div className={styles.actions}>
            <SearchButton />
            <ColorSchemeToggle />
          </div>

          <div className={styles.mobile}>
            <Burger
              aria-label={
                opened ? 'Close navigation menu' : 'Open navigation menu'
              }
              opened={opened}
              onClick={toggle}
            />
          </div>
        </div>
      </div>
      <MobileDrawer opened={opened} onClose={close} scrollY={y} />
    </header>
  )
}
