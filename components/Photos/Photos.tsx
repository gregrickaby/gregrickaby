'use client'

import {CloudinaryResponse} from '@/lib/types'
import clsx from 'clsx'
import {useEffect} from 'react'
import styles from './Photos.module.css'

// Declare a global window property for Fancybox.
declare global {
  interface Window {
    Fancybox: any
  }
}

/**
 * Displays photos fetched from Cloudinary.
 */
export default function Photos({resources}: CloudinaryResponse) {
  /**
   * Load Fancybox and initialize it when the component mounts.
   */
  useEffect(() => {
    const loadFancybox = async () => {
      // Check and load Fancybox CSS only if it's not already loaded.
      if (!document.querySelector('link[href*="fancybox.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href =
          '//cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.css'
        document.head.appendChild(link)
      }

      // Check and load Fancybox JavaScript only if it's not already loaded.
      if (!document.querySelector('script[src*="fancybox.umd.js"]')) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src =
            '//cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.umd.js'
          script.async = true
          script.defer = true
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Fancybox'))
          document.head.appendChild(script)
        })

        // Initialize Fancybox after loading the JavaScript.
        const Fancybox = window.Fancybox
        Fancybox.bind('[data-fancybox]', {
          animated: false,
          groupAll: true,
          defaultDisplay: 'flex',
          Toolbar: {
            display: {
              left: ['infobar'],
              middle: ['zoomIn', 'zoomOut', 'toggle1to1'],
              right: ['slideshow', 'thumbs', 'download', 'close']
            }
          }
        })
      }
    }

    // Catch and log any errors during Fancybox loading.
    loadFancybox().catch(console.error)

    return () => {
      // Clean up Fancybox bindings if necessary when component unmounts.
      const Fancybox = window.Fancybox
      if (Fancybox?.destroy) {
        Fancybox.destroy()
      }
    }
  }, [])

  // If there are no photos, display a message.
  if (!resources || resources.length === 0) {
    return (
      <p>There was an error fetching the images. Please try again later.</p>
    )
  }

  return (
    <div className={styles.photos}>
      <ul className={clsx('not-prose', styles.grid)}>
        {resources.map((photo) => (
          <figure className={styles.figure} key={photo.public_id}>
            <a data-fancybox="gallery" href={photo.secure_url}>
              <img
                alt={photo.public_id}
                className={styles.image}
                height={photo.height}
                loading="lazy"
                src={photo.secure_url}
                width={photo.width}
              />
            </a>
          </figure>
        ))}
      </ul>
    </div>
  )
}
