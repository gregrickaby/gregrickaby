import type { DemoEntry } from '@/lib/types'

import { ControllerDemo, GameDemo, JumpDemo } from './demos'

/** The demos this post places with `<div data-demo="name"></div>`. */
export const DEMOS: Record<string, DemoEntry> = {
  controller: { title: 'Press any button', Body: ControllerDemo },
  jump: { title: 'Tap or hold', Body: JumpDemo },
  game: { title: 'Find the cassette tape', Body: GameDemo },
}
