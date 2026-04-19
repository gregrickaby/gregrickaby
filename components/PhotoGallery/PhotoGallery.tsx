'use client'

import type {PhotoMeta} from '@/lib/types'
import {useMediaQuery} from '@mantine/hooks'
import dynamic from 'next/dynamic'
import {useState} from 'react'
import 'react-photo-album/masonry.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import styles from './PhotoGallery.module.css'

const MasonryPhotoAlbum = dynamic(
  () =>
    import('react-photo-album').then((m) => ({default: m.MasonryPhotoAlbum})),
  {ssr: false}
)
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), {
  ssr: false
})

/**
 * Props for the PhotoGallery component.
 *
 * @interface
 */
interface PhotoGalleryProps {
  /** Array of photo metadata to display. */
  photos: PhotoMeta[]
}

/**
 * Builds a description string for a photo slide from its EXIF metadata.
 *
 * @param photo - The photo metadata.
 * @returns A formatted EXIF string, or undefined when no EXIF data is present.
 */
function buildSlideDescription(photo: PhotoMeta): string | undefined {
  const parts: string[] = []
  if (photo.camera) parts.push(photo.camera)
  if (photo.lens) parts.push(photo.lens)
  if (photo.focalLength) parts.push(photo.focalLength)
  if (photo.aperture) parts.push(photo.aperture)
  if (photo.shutterSpeed) parts.push(photo.shutterSpeed)
  if (photo.iso) parts.push(`ISO ${photo.iso}`)
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/**
 * Client component that renders a masonry photo grid using react-photo-album
 * and a YARL lightbox overlay. Clicking any photo opens the full-resolution
 * lightbox at the correct index.
 *
 * @param props - The props for the PhotoGallery component.
 * @returns A React element with the masonry grid and lightbox overlay.
 */
export function PhotoGallery({photos}: Readonly<PhotoGalleryProps>) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const albumPhotos = photos.map((photo) => ({
    src: `/content/photos/${photo.filename}`,
    alt: photo.title,
    width: photo.width,
    height: photo.height,
    key: photo.filename
  }))

  const slides = photos.map((photo) => ({
    src: `/content/photos/${photo.filename}`,
    alt: photo.title,
    width: photo.width,
    height: photo.height,
    title: photo.title,
    description: buildSlideDescription(photo)
  }))

  return (
    <>
      <div className={styles.gallery}>
        <MasonryPhotoAlbum
          columns={isMobile ? 1 : 3}
          onClick={({index}) => setLightboxIndex(index)}
          photos={albumPhotos}
        />
      </div>
      <Lightbox
        captions={{descriptionTextAlign: 'center', showToggle: true}}
        className={styles.lightbox}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        plugins={[Captions, Download, Fullscreen, Zoom, Slideshow]}
        slides={slides}
      />
    </>
  )
}
