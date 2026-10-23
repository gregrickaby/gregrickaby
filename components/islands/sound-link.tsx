'use client'

import type { ComponentProps } from 'react'

import { playSound, type SoundName } from './sounds'

/** A plain link that plays a sound when clicked. */
export function SoundLink({ sound, ...props }: ComponentProps<'a'> & { sound: SoundName }) {
  return <a {...props} onClick={() => playSound(sound)} />
}
