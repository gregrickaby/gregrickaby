'use client'

import {getCaption} from '@/lib/utils'
import {Fancybox} from '@fancyapps/ui/dist/fancybox/'
import {useEffect, useRef} from 'react'

import '@fancyapps/ui/dist/fancybox/fancybox.css'

export function useFancybox() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Decorate images with data attributes for Fancybox.
    const images = container.querySelectorAll<HTMLImageElement>('img')
    images.forEach((img) => {
      // Skip images already wrapped in an anchor tag.
      if (img.parentElement?.tagName === 'A') return

      const caption = getCaption(img)

      // Determine gallery group: sibling images share a group.
      const parent = img.parentElement
      const siblings = parent?.querySelectorAll('img')
      const group =
        siblings && siblings.length > 1 ? 'gallery' : `single-${img.src}`

      const link = document.createElement('a')
      link.href = img.getAttribute('src') ?? img.src
      link.setAttribute('data-fancybox', group)
      if (caption) link.setAttribute('data-caption', caption)

      img.replaceWith(link)
      link.appendChild(img)
    })

    Fancybox.bind(container, '[data-fancybox]', {
      showClass: 'f-fadeIn',
      hideClass: 'f-fadeOut'
    })

    return () => Fancybox.unbind(container, '[data-fancybox]')
  }, [])

  return {containerRef}
}
