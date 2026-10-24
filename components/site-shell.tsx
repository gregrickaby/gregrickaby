import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

import styles from './site-shell.module.css'

/**
 * The skip link, header, main landmark, and footer around every page except
 * `/geocities`, which brings its own.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className={`no-print ${styles.skip}`} href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main className={styles.main} id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
