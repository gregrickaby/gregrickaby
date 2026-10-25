import Link from 'next/link'

import { LofiRadio } from '@/components/islands/lofi-radio'

import styles from './missing-page.module.css'

/**
 * A lost ghost, one string per row of pixels: `x` is its outline, `#` its
 * sheet, `o` its eyes, `b` its blush, and a space is empty.
 */
const GHOST = [
  '     xxxxxx     ',
  '   xx######xx   ',
  '  x##########x  ',
  ' x############x ',
  ' x############x ',
  'x###oo####oo###x',
  'x###oo####oo###x',
  'x##############x',
  'x#bb########bb#x',
  'x##############x',
  'x##############x',
  'x##############x',
  'x##############x',
  'x##xx##xx##xx##x',
  ' xx  xx  xx  xx ',
]

/** The class that colors each kind of pixel in `GHOST`. */
const PIXELS: Record<string, string | undefined> = {
  x: styles.outline,
  '#': styles.sheet,
  o: styles.eye,
  b: styles.blush,
}

/** Musical notes that float up from the ghost while a tape plays. */
const NOTES = ['♪', '♫', '♪']

/** The ghost, drawn as square pixels. */
function Ghost() {
  return (
    <svg aria-hidden="true" className={styles.ghost} viewBox="0 0 16 15">
      {GHOST.flatMap((row, y) =>
        [...row].map((pixel, x) =>
          pixel === ' ' ? null : (
            <rect className={PIXELS[pixel]} height="1" key={`${x}-${y}`} width="1" x={x} y={y} />
          ),
        ),
      )}
    </svg>
  )
}

/**
 * The 404 screen, in two columns: a lost ghost who explains in a game-style
 * dialog box and offers a menu of ways out, and a tape deck to pass the time.
 */
export function MissingPage() {
  return (
    <div className={styles.notFound}>
      <div className={styles.scene}>
        <hgroup className={styles.heading}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.subtitle}>Stage not found</p>
        </hgroup>
        <div className={styles.stage}>
          <span aria-hidden="true" className={styles.stars} />
          <Ghost />
          {NOTES.map((note, i) => (
            <span aria-hidden="true" className={styles.note} key={i}>
              {note}
            </span>
          ))}
          <span aria-hidden="true" className={styles.shadow} />
        </div>
        <div className={styles.dialog}>
          <p className={styles.speaker}>Ghost</p>
          <p>
            Boo! The page you&apos;re looking for doesn&apos;t exist. It may have moved, or maybe it
            was never here. Pick a way out, or stay and chill with some lo&#8209;fi beats.
          </p>
        </div>
        <nav aria-label="Ways out" className={styles.ways}>
          <ul className={styles.menu}>
            <li>
              <Link href="/">Go back home</Link>
            </li>
            <li>
              <Link href="/search">Search the blog</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className={styles.player}>
        <LofiRadio />
        <p className={styles.prompt}>Press play to continue</p>
      </div>
    </div>
  )
}
