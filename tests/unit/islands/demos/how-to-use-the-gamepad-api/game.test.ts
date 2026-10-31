import { describe, expect, it } from 'vitest'

import { GHOST } from '@/components/ghost'
import {
  CASSETTE,
  CRACKLE,
  DEATH_PAUSE,
  GOAL,
  LIVES,
  newWorld,
  NOTE,
  POINTS,
  stepWorld,
  type GameEvent,
  type Ghost,
  type Help,
  type Input,
  type World,
} from '@/components/islands/demos/how-to-use-the-gamepad-api/game'
import { JUMP_CUT, JUMP_SPEED } from '@/components/islands/demos/how-to-use-the-gamepad-api/gamepad'
import { LEVEL_SONG } from '@/components/islands/demos/how-to-use-the-gamepad-api/music'
import { noteFrequency } from '@/components/islands/sequencer'

const FRAME = 1 / 60
const IDLE: Input = { x: 0, held: false, pressed: false }
const RIGHT: Input = { ...IDLE, x: 1 }
const JUMP: Input = { ...IDLE, held: true, pressed: true }
const BOTH: Help = { coyote: true, buffer: true, double: false }
const NONE: Help = { coyote: false, buffer: false, double: false }

/** A fresh level with the ghost moved to `x`, `y`, and any other changes. */
function at(x: number, y: number, ghost: Partial<Ghost> = {}): World {
  const world = newWorld()
  return { ...world, ghost: { ...world.ghost, x, y, ...ghost } }
}

/** Steps the level `frames` times with the same input, collecting every event. */
function run(world: World, input: Input, frames: number, help = BOTH) {
  const events: GameEvent[] = []
  for (let i = 0; i < frames; i++) {
    const step = stepWorld(world, input, FRAME, help)
    world = step.world
    events.push(...step.events)
  }
  return { world, events }
}

describe('sprites', () => {
  it('has rows of one width', () => {
    for (const art of [GHOST, NOTE, CASSETTE, ...CRACKLE]) {
      for (const row of art) expect(row).toHaveLength(art[0].length)
    }
  })
})

describe('LEVEL_SONG', () => {
  it('has eight 16-step bars per lane, every token a note, a drum, a hold, or a rest', () => {
    for (const [lane, bars] of Object.entries(LEVEL_SONG.lanes)) {
      expect(bars).toHaveLength(8)
      for (const bar of bars) {
        const tokens = bar.split(' ')
        expect(tokens).toHaveLength(16)
        for (const token of tokens) {
          const known =
            token === '.' ||
            token === '-' ||
            (lane === 'noise' ? 'khs'.includes(token) : noteFrequency(token) !== undefined)
          expect(known, `${lane}: ${token}`).toBe(true)
        }
      }
    }
  })
})

describe('stepWorld', () => {
  it('stands still on the ground', () => {
    const { world, events } = run(newWorld(), IDLE, 30)
    expect(world.ghost).toMatchObject({ x: 16, y: 85, vy: 0, sinceGround: 0 })
    expect(events).toEqual([])
  })

  it('jumps on a press, and cuts the jump short on release', () => {
    const jumped = stepWorld(newWorld(), JUMP, FRAME, BOTH)
    expect(jumped.events).toEqual(['jump'])
    expect(jumped.world.ghost.vy).toBeCloseTo(-JUMP_SPEED + 30)
    const cut = stepWorld(jumped.world, IDLE, FRAME, BOTH)
    expect(cut.world.ghost.vy).toBeCloseTo(-JUMP_CUT + 30)
  })

  it('stops at the left edge of the level', () => {
    const { world } = run(newWorld(), { ...IDLE, x: -1 }, 30)
    expect(world.ghost.x).toBe(0)
  })

  it('stops at the side of a ledge from either direction', () => {
    expect(stepWorld(at(103, 60), RIGHT, FRAME, BOTH).world.ghost.x).toBe(104)
    expect(stepWorld(at(169, 60), { ...IDLE, x: -1 }, FRAME, BOTH).world.ghost.x).toBe(168)
  })

  it('bumps its head on the underside of a ledge', () => {
    const { world } = stepWorld(at(130, 72, { vy: -300, sinceGround: 1 }), IDLE, FRAME, BOTH)
    expect(world.ghost).toMatchObject({ y: 70, vy: 0 })
  })

  it('loses a life in a pit, freezes for the death music, then starts over', () => {
    const fell = run(at(40, 85), RIGHT, 130)
    expect(fell.events).toEqual(['note', 'hurt'])
    expect(fell.world).toMatchObject({ lives: LIVES - 1, score: POINTS.note })
    expect(fell.world.dying).toBeGreaterThan(0)
    const frozen = run(fell.world, RIGHT, 30)
    expect(frozen.world.ghost).toEqual(fell.world.ghost)
    expect(frozen.world.crackles).toEqual(fell.world.crackles)
    const back = run(frozen.world, IDLE, Math.ceil(DEATH_PAUSE * 60))
    expect(back.events).toEqual([])
    expect(back.world).toMatchObject({ dying: 0, ghost: { x: 16, y: 85 } })
    expect(back.world.notes[0]?.got).toBe(true)
  })

  it('ends the game on the last life, then stops', () => {
    const { world, events } = stepWorld({ ...at(285, 85), lives: 1 }, RIGHT, FRAME, BOTH)
    expect(events).toEqual(['gameover'])
    expect(world).toMatchObject({ lives: 0, over: true, dying: 0 })
    expect(stepWorld(world, RIGHT, FRAME, BOTH)).toEqual({ world, events: [] })
  })

  it('jumps a moment after walking off a ledge only with coyote time on', () => {
    const { world } = run(at(212, 85), RIGHT, 12, NONE)
    expect(world.ghost.x).toBeGreaterThan(230)
    expect(world.ghost.sinceGround).toBeGreaterThan(0)
    const late = { ...JUMP, x: 1 }
    expect(
      stepWorld(world, late, FRAME, { coyote: true, buffer: false, double: false }).events,
    ).toEqual(['jump'])
    expect(
      stepWorld(world, late, FRAME, { coyote: false, buffer: true, double: false }).events,
    ).toEqual([])
  })

  it('remembers a press just before landing only with jump buffering on', () => {
    const falling = at(100, 78, { vy: 100, sinceGround: 1 })
    for (const [help, expected] of [
      [{ coyote: false, buffer: true, double: false }, ['jump']],
      [{ coyote: true, buffer: false, double: false }, []],
    ] as const) {
      const pressed = stepWorld(falling, JUMP, FRAME, help)
      expect(pressed.events).toEqual([])
      expect(run(pressed.world, { ...IDLE, held: true }, 10, help).events).toEqual(expected)
    }
  })

  it('jumps once more in midair only with double jump on, until it lands', () => {
    const double: Help = { ...NONE, double: true }
    const up = stepWorld(newWorld(), JUMP, FRAME, double)
    expect(up.events).toEqual(['jump'])
    const rising = run(up.world, { ...IDLE, held: true }, 10, double).world
    expect(stepWorld(rising, JUMP, FRAME, NONE).events).toEqual([])
    const second = stepWorld(rising, JUMP, FRAME, double)
    expect(second.events).toEqual(['double'])
    expect(second.world.ghost.airJumps).toBe(0)
    expect(stepWorld(second.world, JUMP, FRAME, double).events).toEqual([])
    expect(run(second.world, IDLE, 90, double).world.ghost.airJumps).toBe(1)
  })

  it('walks each crackle back and forth along its patrol', () => {
    const there = run(newWorld(), IDLE, 240).world.crackles[0]
    expect(there).toMatchObject({ dir: -1 })
    const back = run(newWorld(), IDLE, 480).world.crackles[0]
    expect(back).toMatchObject({ dir: 1 })
  })

  it('pops a crackle landed on from above, and bounces', () => {
    const { world, events } = stepWorld(
      at(298, 74, { vy: 200, sinceGround: 1, airJumps: 0 }),
      IDLE,
      FRAME,
      BOTH,
    )
    expect(events).toEqual(['stomp'])
    expect(world.score).toBe(POINTS.stomp)
    expect(world.ghost.airJumps).toBe(1)
    expect(world.crackles[0]?.alive).toBe(false)
    expect(world.ghost.vy).toBeLessThan(0)
    const later = run(world, IDLE, 60).world.crackles[0]
    expect(later).toEqual(world.crackles[0])
  })

  it('loses a life walking into a crackle', () => {
    const { world, events } = stepWorld(at(285, 85), RIGHT, FRAME, BOTH)
    expect(events).toEqual(['hurt'])
    expect(world).toMatchObject({ lives: LIVES - 1, dying: DEATH_PAUSE })
  })

  it('wins on reaching the cassette, then stops', () => {
    const { world, events } = run(at(GOAL[0] - 20, 85), RIGHT, 30)
    expect(events).toEqual(['win'])
    expect(world).toMatchObject({ won: true, score: POINTS.win })
    expect(stepWorld(world, RIGHT, FRAME, BOTH)).toEqual({ world, events: [] })
  })
})
