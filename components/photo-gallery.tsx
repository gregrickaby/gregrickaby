import Image from 'next/image'
import type { CSSProperties } from 'react'

import { Lightbox } from '@/components/islands/lightbox'
import { exifSummary } from '@/lib/format'
import { aspectRatio, fullImageUrl } from '@/lib/images'
import type { Photo } from '@/lib/types'

import styles from './photo-gallery.module.css'

/**
 * Rows start 15rem tall (photo-gallery.module.css) and stretch to fill the
 * width, which in practice stops short of 25rem. So a photo is at most its
 * aspect ratio times 25rem wide, and a viewport-based `sizes` overshoots.
 */
const MAX_ROW_HEIGHT = 25

function getRatio({ width, height }: Photo): number {
  return height ? width / height : 1
}

/**
 * Justified rows of photos, newest first, read left to right. Each photo grows
 * by its aspect ratio, so a row shares one height and nothing is cropped. Each
 * photo links to its original file; the lightbox opens a large version with
 * the title and EXIF details.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <Lightbox className={styles.gallery}>
      {photos.map((photo, i) => {
        const details = exifSummary(photo)
        const ratio = getRatio(photo)
        // On a screen narrower than that, the photo is at most the screen's width.
        const widest = Math.round(ratio * MAX_ROW_HEIGHT * 100) / 100
        return (
          <a
            className={styles.photo}
            data-caption={photo.caption ? `${photo.title}: ${photo.caption}` : photo.title}
            data-details={details || undefined}
            data-full={fullImageUrl(photo.src, photo.width, photo.hdr)}
            data-lightbox=""
            href={photo.src}
            key={photo.filename}
            style={{ '--ratio': ratio } as CSSProperties}
          >
            <Image
              alt={photo.title}
              className={styles.image}
              height={photo.height}
              preload={i < 3}
              sizes={`(max-width: ${widest}rem) 100vw, ${widest}rem`}
              src={photo.src}
              style={aspectRatio(photo)}
              width={photo.width}
            />
            <span aria-hidden="true" className={styles.overlay}>
              <span className={styles.title}>{photo.title}</span>
              {details ? <span className={styles.exif}>{details}</span> : null}
            </span>
          </a>
        )
      })}
    </Lightbox>
  )
}
