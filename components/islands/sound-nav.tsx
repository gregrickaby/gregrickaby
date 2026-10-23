'use client'

import type { ComponentProps, PointerEvent } from 'react'

import { playSound } from './sounds'

/**
 * A `<nav>` that ticks when a mouse moves onto one of its links. Touch and pen
 * have no hover, so taps only get the click sounds.
 */
export function SoundNav(props: ComponentProps<'nav'>) {
  function onPointerOver(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const link = (event.target as Element).closest('a')
    const from = event.relatedTarget instanceof Node ? event.relatedTarget : null
    if (link && !link.contains(from)) playSound('hover')
  }

  return <nav {...props} onPointerOver={onPointerOver} />
}
