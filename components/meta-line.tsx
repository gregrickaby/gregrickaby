import { Fragment, type ReactNode } from 'react'

import styles from './meta-line.module.css'

/**
 * A row of small uppercase details separated by dots, styled like a camera's
 * EXIF readout: `JAN 11 2024 · 6 MIN READ · BLOG`. Empty items are skipped.
 */
export function MetaLine({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((item) => item !== null && item !== undefined && item !== '')
  return (
    <p className={className ? `${styles.line} ${className}` : styles.line}>
      {shown.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? <span aria-hidden="true"> · </span> : null}
          {item}
        </Fragment>
      ))}
    </p>
  )
}
