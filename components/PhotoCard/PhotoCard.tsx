import type {PhotoMeta} from '@/lib/types'
import {buildPhotoCaption, formatPhotoDate} from '@/lib/utils'
import {Text} from '@mantine/core'
import styles from './PhotoCard.module.css'

/**
 * Props for the PhotoCard component.
 *
 * @interface
 */
interface PhotoCardProps {
  /** The photo metadata including EXIF data. */
  photo: PhotoMeta
  /** Optional. Whether to priority-load this image. */
  priority?: boolean
}

/**
 * Card component for a single photo in the masonry grid. Renders the image
 * wrapped in a Fancybox-compatible anchor, with EXIF metadata displayed below.
 *
 * @param props - The props for the PhotoCard component.
 * @returns A React element with the photo card.
 */
export function PhotoCard({photo, priority = false}: Readonly<PhotoCardProps>) {
  const src = `/content/photos/${photo.filename}`
  const caption = buildPhotoCaption(photo)

  // Gather EXIF details for the strip below the image.
  const exifItems: string[] = []
  if (photo.aperture) exifItems.push(photo.aperture)
  if (photo.shutterSpeed) exifItems.push(photo.shutterSpeed)
  if (photo.iso) exifItems.push(`ISO ${photo.iso}`)
  if (photo.focalLength) exifItems.push(photo.focalLength)

  return (
    <div className={styles.card}>
      <a
        className={styles.imageLink}
        data-caption={caption}
        data-fancybox="photos"
        href={src}
      >
        <img
          alt={photo.title}
          className={styles.image}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          src={src}
          width={photo.width}
        />
      </a>
      <div className={styles.meta}>
        <Text className={styles.title} fw={600} size="sm" lineClamp={1}>
          {photo.title}
        </Text>
        {photo.camera && (
          <Text c="dimmed" size="xs">
            {photo.camera}
            {photo.lens ? ` · ${photo.lens}` : ''}
          </Text>
        )}
        {exifItems.length > 0 && (
          <Text c="dimmed" size="xs">
            {exifItems.join(' · ')}
          </Text>
        )}
        {photo.dateTaken && (
          <Text c="dimmed" size="xs">
            {formatPhotoDate(photo.dateTaken)}
          </Text>
        )}
      </div>
    </div>
  )
}
