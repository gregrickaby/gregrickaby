import type { DemoEntry } from '@/lib/types'

import { ConsoleDemo, FadeDemo, HarmonicsDemo, NoiseDemo, NotesDemo, ScaleDemo } from './demos'
import { JukeboxDemo } from './jukebox'
import { TapeDemo } from './tape-deck'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  console: { title: 'Try it out', Body: ConsoleDemo },
  harmonics: { title: 'Build a square wave', Body: HarmonicsDemo },
  scale: { title: 'Climb the scale', Body: ScaleDemo },
  notes: { title: '8-bit sound generator', Body: NotesDemo },
  fade: { title: 'Fade it or cut it', Body: FadeDemo },
  noise: { title: 'Crunch the noise', Body: NoiseDemo },
  jukebox: { title: 'Press start', Body: JukeboxDemo },
  tape: { title: 'Put on some lo-fi', Body: TapeDemo },
}
