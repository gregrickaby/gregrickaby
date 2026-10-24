'use client'

import Link from 'next/link'
import type { ComponentProps, PointerEvent } from 'react'

import { playSound } from './sounds'

/**
 * A `next/link` that ticks when a mouse moves onto it and blips when clicked,
 * like the links in a `SoundNav`.
 */
export function SoundRouteLink(props: ComponentProps<typeof Link>) {
  function onPointerEnter(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === 'mouse') playSound('hover')
  }

  return <Link {...props} onClick={() => playSound('select')} onPointerEnter={onPointerEnter} />
}
