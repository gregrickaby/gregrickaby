import Image from 'next/image'
import { Lightbox } from '@/components/islands/lightbox'
import { exifSummary } from '@/lib/format'
import { fullImageUrl } from '@/lib/images'
import type { Photo } from '@/lib/types'
import styles from './photo-gallery.module.css'

/**
 * A masonry grid of photos in CSS columns. Each photo links to its original
 * file; the lightbox opens a large version with the title and EXIF details.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <Lightbox className={styles.gallery}>
      {photos.map((photo, i) => (
        <a
          className={styles.photo}
          data-caption={photo.caption ? `${photo.title}: ${photo.caption}` : photo.title}
          data-details={exifSummary(photo) || undefined}
          data-full={fullImageUrl(photo.src, photo.width, photo.hdr)}
          data-lightbox=""
          href={photo.src}
          key={photo.filename}
        >
          <Image
            alt={photo.title}
            className={styles.image}
            height={photo.height}
            preload={i < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 360px"
            src={photo.src}
            width={photo.width}
          />
        </a>
      ))}
    </Lightbox>
  )
}
