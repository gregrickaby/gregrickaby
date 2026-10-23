import type { ReactNode } from 'react'

import styles from './page-title.module.css'

/** A page's centered heading. */
export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>
}
