import Image from 'next/image'
import Link from 'next/link'

import { SoundNav } from '@/components/islands/sound-nav'
import { MetaLine } from '@/components/meta-line'
import { getPhotos } from '@/lib/content'
import { exifSummary } from '@/lib/format'
import { HOME, SITE } from '@/lib/site'

import styles from './home-hero.module.css'

/**
 * The home page banner: one of Greg's photos, full-bleed, with his name, what
 * he does, and the three ways into the site. The photo's EXIF sits in the
 * corner, the way a photographer would caption it.
 */
export function HomeHero() {
  const photo = getPhotos().find((p) => p.filename === HOME.photo)

  return (
    <section aria-labelledby="home-title" className={styles.hero}>
      {photo ? (
        <Image
          alt=""
          className={styles.photo}
          fetchPriority="high"
          fill
          loading="eager"
          sizes="100vw"
          src={photo.src}
        />
      ) : null}
      <div className={styles.content}>
        <MetaLine className={styles.roles} items={[...HOME.roles]} />
        <h1 className={styles.name} id="home-title">
          {SITE.name}
        </h1>
        <p className={styles.summary}>{HOME.summary}</p>
        <SoundNav aria-label="Start here" className={styles.actions} clickSound="select">
          <Link className={`${styles.action} ${styles.primary}`} href="/resume">
            Resume
          </Link>
          <Link className={styles.action} href="/photos">
            Photos
          </Link>
          <Link className={styles.action} href="/blog">
            Writing
          </Link>
        </SoundNav>
      </div>
      {photo ? (
        <MetaLine
          className={styles.caption}
          items={[photo.title, exifSummary({ ...photo, camera: undefined, lens: undefined })]}
        />
      ) : null}
    </section>
  )
}
