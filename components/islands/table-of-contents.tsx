'use client'

import { useEffect, useState } from 'react'

import type { Heading } from '@/lib/types'

import styles from './table-of-contents.module.css'

/**
 * A post's h2 and h3 headings as links: a disclosure above the body on
 * narrow screens, and always open in the sidebar on wide ones. With
 * JavaScript, the section being read is marked as the reader scrolls.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const targets = headings
      .map(({ id }) => document.getElementById(id))
      .filter((target) => target !== null)
    // The section being read starts at the last heading above the window's top third.
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight / 3
        setActive(
          targets.findLast((target) => target.getBoundingClientRect().top <= line)?.id ?? null,
        )
      },
      { rootMargin: '0px 0px -67% 0px' },
    )
    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [headings])

  return (
    <nav aria-label="Table of contents">
      <details className={styles.details}>
        <summary className={styles.summary}>Table of contents</summary>
        <ol className={styles.list} role="list">
          {headings.map(({ id, text, depth }) => (
            <li className={depth === 3 ? styles.sub : undefined} key={id}>
              <a
                aria-current={active === id ? 'location' : undefined}
                className={styles.link}
                href={`#${id}`}
              >
                {text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  )
}
