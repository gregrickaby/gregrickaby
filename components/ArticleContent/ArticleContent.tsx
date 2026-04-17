'use client'

import {useLightbox} from '@/lib/hooks/useLightbox/useLightbox'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/styles.css'
import classes from './ArticleContent.module.css'

/**
 * Props for the ArticleContent component.
 *
 * @interface
 */
interface ArticleContentProps {
  /** The rendered HTML content to display. */
  content: string
}

/**
 * Renders sanitized HTML content from a post or page with a YARL lightbox
 * for image viewing.
 *
 * @param props - The props for the ArticleContent component.
 * @returns A React element with the rendered content and lightbox overlay.
 */
export function ArticleContent({content}: Readonly<ArticleContentProps>) {
  const {containerRef, slides, lightboxIndex, closeLightbox} = useLightbox()

  return (
    <>
      <div
        className={classes.articleContent}
        dangerouslySetInnerHTML={{__html: content}}
        ref={containerRef}
      />
      <Lightbox
        close={closeLightbox}
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        plugins={[Captions]}
        slides={slides}
      />
    </>
  )
}
