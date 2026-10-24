import type { Metadata } from 'next'
import { Antonio } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

import { SubspacePlayer } from '@/components/islands/subspace-player'

import styles from './page.module.css'

/*
 * The easter egg prerenders like the rest of the site. It sits outside the
 * (site) group so it gets its own frame instead of the site header and footer.
 */
export const ensureStatic = 'navigation'

const lcars = Antonio({ subsets: ['latin'], variable: '--font-antonio', display: 'swap' })

export const metadata: Metadata = {
  title: 'Personal log, stardate 1997',
  description: 'A Geocities-era homepage, beamed through an LCARS terminal.',
  robots: { index: false, follow: false },
}

/** The sidebar's LCARS buttons, each a real page on the site. */
const DECKS = [
  { code: '01', label: 'Home', href: '/' },
  { code: '02', label: "Captain's log", href: '/blog' },
  { code: '03', label: 'Imaging', href: '/photos' },
  { code: '04', label: 'Service record', href: '/resume' },
  { code: '05', label: 'Hailing', href: '/contact' },
] as const

/** An animated GIF from the original page. Animated images gain nothing from the optimizer, so they skip it. */
function Gif({
  alt = '',
  height,
  src,
  width,
}: {
  alt?: string
  height: number
  src: string
  width: number
}) {
  return <Image alt={alt} height={height} src={`/geocities/${src}`} unoptimized width={width} />
}

/**
 * A Geocities homepage from 1997, running on a starship computer: an LCARS
 * frame of elbows and colored buttons around a starfield of animated GIFs,
 * with a subspace radio that dials up and plays a fanfare.
 */
export default function GeocitiesPage() {
  return (
    <div className={`${lcars.variable} ${styles.page}`}>
      <div className={styles.frame}>
        <div aria-hidden="true" className={`${styles.elbow} ${styles.elbowTop}`} />
        <header className={styles.bar}>
          <span aria-hidden="true" className={styles.curve} />
          <span aria-hidden="true" className={styles.block} />
          <p className={styles.title}>Library computer access and retrieval system</p>
          <span aria-hidden="true" className={styles.block} />
        </header>

        <nav aria-label="Decks" className={styles.sidebar}>
          <ul role="list">
            {DECKS.map((deck) => (
              <li key={deck.href}>
                <Link className={styles.deck} href={deck.href}>
                  <span className={styles.code}>{deck.code}</span> {deck.label}
                </Link>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className={styles.filler} />
        </nav>

        <main className={styles.screen} id="main">
          <Link className={styles.banner} href="/">
            <Gif alt="Welcome to my homepage" height={173} src="welcome.gif" width={600} />
          </Link>

          <div className={styles.row}>
            <Gif height={80} src="combadge.gif" width={80} />
            <p className={styles.marquee}>
              <span>To boldly go where no one has gone before</span>
            </p>
            <Gif height={80} src="combadge.gif" width={80} />
          </div>

          <div className={styles.flyby}>
            <Image
              alt="The original starship Enterprise"
              height={160}
              src="/geocities/enterprise.webp"
              width={160}
            />
          </div>

          <section className={styles.report}>
            <h1 className={styles.heading}>Mr. Data, report...</h1>
            <Image
              alt="Captain Picard and Lt. Commander Data on the bridge"
              height={480}
              src="/geocities/picard-data.jpg"
              width={650}
            />
            <p>
              Yes sir... He appears to be an Alabama-based software engineer, Technical Lead at
              Mindsize, self-taught photographer, published author, and proud survivor of the
              Geocities era. He has been building for the web since 1997. Outside of work,
              you&apos;ll find him behind a camera, tossing pizzas, or planning the next family road
              trip.
            </p>
            <Gif
              alt="Lt. Commander Data's sarcasm face"
              height={430}
              src="commander-data-sarcasm.gif"
              width={480}
            />
          </section>

          <footer className={styles.footer}>
            <div className={styles.row}>
              <Gif height={42} src="earth.gif" width={39} />
              <Link href="/" rel="author">
                Go back to the Alpha Quadrant
              </Link>
              <Gif height={42} src="earth.gif" width={39} />
            </div>
            <p className={styles.badges}>
              <Gif alt="Visitor counter" height={20} src="counter.gif" width={90} />
              <Gif alt="Netscape Now" height={31} src="netscape.gif" width={88} />
              <Gif alt="Get Internet Explorer" height={31} src="ie.gif" width={88} />
              <Gif alt="Made with Notepad" height={43} src="notepad.gif" width={114} />
            </p>
            <p className={styles.best}>
              Best viewed in Netscape Navigator 3.0 at 800 &times; 600.{' '}
              <span className={styles.blink}>New!</span>
            </p>
            <Gif height={82} src="flames.gif" width={600} />
          </footer>
        </main>

        <div aria-hidden="true" className={`${styles.elbow} ${styles.elbowBottom}`} />
        <div aria-hidden="true" className={`${styles.bar} ${styles.barBottom}`}>
          <span className={styles.curve} />
          <span className={styles.block} />
          <span className={styles.block} />
          <span className={styles.block} />
        </div>
      </div>
      <SubspacePlayer />
    </div>
  )
}
