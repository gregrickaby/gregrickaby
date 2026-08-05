'use client'

import dynamic from 'next/dynamic'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/styles.css'
import type {
  LightboxProps as YARLProps,
  Plugin,
  Slide
} from 'yet-another-react-lightbox'

const YARLightbox = dynamic(() => import('yet-another-react-lightbox'), {
  ssr: false
})

/**
 * Props for the Lightbox component.
 *
 * @interface
 */
interface LightboxProps {
  /** The slides to display. */
  slides: Slide[]
  /** Index of the currently open slide, or -1 when closed. */
  index: number
  /** Whether the lightbox is open. */
  open: boolean
  /** Callback invoked to close the lightbox. */
  close: () => void
  /** Optional. Additional CSS class for the lightbox root. */
  className?: string
  /** Optional. Additional plugins beyond Captions, which is always included. */
  plugins?: Plugin[]
  /** Optional. Captions plugin settings. */
  captions?: YARLProps['captions']
}

/**
 * Shared YARL (yet-another-react-lightbox) wrapper. Owns the dynamic import
 * and the Captions plugin/styles setup so callers only need to supply their
 * own slides and any extra plugins.
 *
 * @param props - The props for the Lightbox component.
 * @returns A React element with the lightbox overlay.
 */
export function Lightbox({
  slides,
  index,
  open,
  close,
  className,
  plugins = [],
  captions
}: Readonly<LightboxProps>) {
  return (
    <YARLightbox
      captions={captions}
      className={className}
      close={close}
      index={index}
      open={open}
      plugins={[Captions, ...plugins]}
      slides={slides}
    />
  )
}
