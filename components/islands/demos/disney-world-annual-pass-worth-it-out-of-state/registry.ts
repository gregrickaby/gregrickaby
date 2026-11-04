import type { DemoEntry } from '@/lib/types'

import { BreakEvenDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  'break-even': { title: 'Annual pass calculator', Body: BreakEvenDemo },
}
