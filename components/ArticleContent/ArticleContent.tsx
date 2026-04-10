'use client'

import {useFancybox} from '@/lib/hooks/useFancyBox/useFancybox'
import classes from './ArticleContent.module.css'

interface ArticleContentProps {
  content: string
}

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
