import type { DemoEntry } from '@/lib/types'

import { CalculatorDemo, FluidDemo, LineHeightDemo, RemDemo, ScaleDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  calculator: { title: 'Golden ratio typography calculator', Body: CalculatorDemo },
  rem: { title: 'Convert rem to px', Body: RemDemo },
  scale: { title: 'Build a type scale', Body: ScaleDemo },
  'line-height': { title: 'Stretch the line', Body: LineHeightDemo },
  fluid: { title: 'Shrink the screen', Body: FluidDemo },
}
