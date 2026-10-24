'use client'

import type { HTMLAttributes, MouseEvent, PointerEvent } from 'react'

import { playSound, type SoundName } from './sounds'

/**
 * A `<nav>` (or `as` another wrapper) that ticks when a mouse moves onto one
 * of its links or buttons, and plays `clickSound`, when given, as a link is
 * clicked. Touch and pen have no hover, so taps only get the click sound.
 */
export function SoundNav({
  as: Tag = 'nav',
  clickSound,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'nav' | 'ul'; clickSound?: SoundName }) {
  function onPointerOver(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const control = (event.target as Element).closest('a, button')
    const from = event.relatedTarget instanceof Node ? event.relatedTarget : null
    if (control && !control.contains(from)) playSound('hover')
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    if (clickSound && (event.target as Element).closest('a')) playSound(clickSound)
  }

  return <Tag {...props} onClick={onClick} onPointerOver={onPointerOver} />
}
