import type { DemoEntry } from '@/lib/types'

import { GamutDemo, HeadroomDemo, ScreenDemo, WipeDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  screen: { title: 'Check your screen', Body: ScreenDemo },
  gamut: { title: 'Compare color spaces', Body: GamutDemo },
  headroom: { title: 'Turn up the headroom', Body: HeadroomDemo },
  wipe: { title: 'Wipe SDR to HDR', Body: WipeDemo },
}
