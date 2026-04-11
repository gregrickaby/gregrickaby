'use client'

import {useFancybox} from '@/lib/hooks/useFancyBox/useFancybox'
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
 * Renders sanitized HTML content from a post or page with Fancybox
 * integration for image lightboxes.
 *
 * @param props - The props for the ArticleContent component.
 * @returns A React element with the rendered content.
 */
export function ArticleContent({content}: Readonly<ArticleContentProps>) {
  const {containerRef} = useFancybox()

  return (
    <div
      className={classes.articleContent}
      dangerouslySetInnerHTML={{__html: content}}
      ref={containerRef}
    />
  )
}
