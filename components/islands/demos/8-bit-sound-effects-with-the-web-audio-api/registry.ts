import type { DemoEntry } from '@/lib/types'

import { FadeDemo, HarmonicsDemo, NoiseDemo, NotesDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  harmonics: { title: 'Build a square wave', Body: HarmonicsDemo },
  notes: { title: 'Write a sound', Body: NotesDemo },
  fade: { title: 'Hear the click', Body: FadeDemo },
  noise: { title: 'Crunch the noise', Body: NoiseDemo },
}
