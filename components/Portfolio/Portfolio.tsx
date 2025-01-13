'use client'

import config from '@/lib/config'
import {formatShutterSpeed} from '@/lib/functions/formatShutterSpeed'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {Photo} from '@/lib/types'
import {Fancybox} from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import clsx from 'clsx'
import {useEffect} from 'react'
import styles from './Portfolio.module.css'

/**
 * Portfolio component props.
 */
interface PortfolioProps {
  photos: Photo[]
}

/**
 * Portfolio component to display a grid of photos.
 */
export default function Portfolio({photos}: Readonly<PortfolioProps>) {
  useEffect(() => {
    // Initialize Fancybox with options.
    Fancybox.bind('[data-fancybox]', config.fancyboxOptions)

    // Cleanup Fancybox when component is unmounted.
    return () => {
      Fancybox.destroy()
    }
  }, [])

  // If there are no photos, display a message.
  if (!photos || photos.length === 0) {
    return (
      <p>
        There are no photos available at this time. Please check back later.
      </p>
    )
  }

  return (
    <div className={styles.portfolio}>
      <div className={clsx('not-prose', styles.grid)}>
        {photos.map((photo) => {
          // Extract photo caption and extended metadata.
          const caption = photo?.caption?.rendered || ''
          const extendedMeta = photo?.media_details?.image_meta || {}

          // Create a fancy caption with extended metadata.
          const fancyCaption = `<div style="text-align:center;"><p>${sanitizeText(caption)}</p>
            <span style="font-size: 0.8em; color: #666; text-align: center;">
              ${extendedMeta.camera || ''} | ƒ/${extendedMeta.aperture || ''} |
              ${extendedMeta.focal_length || ''}mm |
              ${formatShutterSpeed(extendedMeta.shutter_speed)} | ISO${extendedMeta.iso || ''}
            </span>
            </div>`

          return (
            <figure className={styles.figure} key={photo.id}>
              <a
                aria-label={`View full size image of ${photo.alt_text}`}
                data-caption={fancyCaption}
                data-fancybox
                href={photo.media_details.sizes?.full?.source_url || ''}
              >
                <img
                  alt={photo.alt_text || 'Photo'}
                  className={styles.image}
                  height={photo.media_details?.height || 'auto'}
                  loading="lazy"
                  src={
                    photo.media_details.sizes?.medium_large?.source_url || ''
                  }
                  width={photo.media_details?.width || 'auto'}
                />
                {caption && (
                  <figcaption className={styles.caption}>
                    {sanitizeText(caption)}
                  </figcaption>
                )}
              </a>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
