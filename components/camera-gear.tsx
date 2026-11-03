import Image from 'next/image'

import { Prose } from '@/components/prose'
import { splitSections } from '@/lib/html'
import { aspectRatio } from '@/lib/images'
import { GEAR_PHOTO } from '@/lib/site'
import type { Post } from '@/lib/types'

import styles from './camera-gear.module.css'

/**
 * The gear page's story and gear lists beside a photo of the moon rig, then
 * the affiliate note in small print.
 */
export function CameraGear({ page }: { page: Post }) {
  const [gear, ...sections] = splitSections(page.html)
  const disclaimer = sections.find((s) => s.id === 'affiliate-disclaimer')

  return (
    <>
      <div className={styles.camera}>
        <div className={styles.gear}>
          <Prose html={gear.html} />
        </div>
        <Image
          alt={GEAR_PHOTO.alt}
          className={styles.cameraPhoto}
          fetchPriority="high"
          height={GEAR_PHOTO.height}
          loading="eager"
          sizes="(max-width: 53.75rem) 24rem, 22.5rem"
          src={GEAR_PHOTO.src}
          style={aspectRatio(GEAR_PHOTO)}
          width={GEAR_PHOTO.width}
        />
      </div>
      {disclaimer ? (
        <div aria-label="Affiliate disclaimer" className={styles.disclaimer} role="note">
          <Prose html={disclaimer.html} />
        </div>
      ) : null}
    </>
  )
}
