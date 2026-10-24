'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A post's sticky sidebar. With JavaScript, it's marked `data-covered` while
 * a wide or full-width image in the article scrolls past it, so the sidebar
 * can fade out of the image's way.
 */
export function Sidebar({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [covered, setCovered] = useState(false)

  useEffect(() => {
    const sidebar = ref.current
    const images = [
      ...(sidebar?.closest('article')?.querySelectorAll('.alignwide, .alignfull') ?? []),
    ]
    if (!sidebar || images.length === 0) return
    function check() {
      const { top, bottom } = sidebar!.getBoundingClientRect()
      setCovered(
        images.some((image) => {
          const rect = image.getBoundingClientRect()
          return rect.top < bottom && rect.bottom > top
        }),
      )
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  return (
    <div className={className} data-covered={covered || undefined} ref={ref}>
      {children}
    </div>
  )
}
