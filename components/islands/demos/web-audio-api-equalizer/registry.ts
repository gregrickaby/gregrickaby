import type { DemoEntry } from '@/lib/types'

import { BarsDemo, EqDemo, GhostDemo, KnobDemo, SmoothingDemo, SongDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  bars: { title: 'Watch the bars', Body: BarsDemo },
  smoothing: { title: 'Calm the bars', Body: SmoothingDemo },
  knob: { title: 'Turn one knob', Body: KnobDemo },
  eq: { title: 'Shape the sound', Body: EqDemo },
  ghost: { title: 'Chase the ghost', Body: GhostDemo },
  song: { title: 'Try a real song', Body: SongDemo },
}
