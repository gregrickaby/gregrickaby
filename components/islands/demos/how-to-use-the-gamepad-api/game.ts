import { GHOST } from '@/components/ghost'

import { GRAVITY, JUMP_CUT, JUMP_SPEED } from './gamepad'

/** A rectangle in level pixels: left, top, width, height. `y` counts down from the top. */
export type Box = readonly [x: number, y: number, width: number, height: number]

/** A music note to collect, drawn with `n` pixels. */
export const NOTE = [
  '   nn  ',
  '   n n ',
  '   n  n',
  '   n   ',
  '   n   ',
  ' nnn   ',
  'nnnn   ',
  'nnnn   ',
  ' nn    ',
] as const

/** The enemy, a ball of TV static, in two frames that swap to make it crackle. */
export const CRACKLE = [
  [
    'x  x  x  x',
    ' x sxxs x ',
    ' ssssssss ',
    'xsoossoosx',
    ' soossoos ',
    'xssssssssx',
    ' ssxssxss ',
    'x ss  ss x',
    ' x  xx  x ',
    'x  x  x  x',
  ],
  [
    ' x  xx  x ',
    'x  sxxs  x',
    'xssssssssx',
    ' soossoos ',
    'xsoossoosx',
    ' ssssssss ',
    'xssxssxssx',
    ' x ss  ss ',
    'x  x  x  x',
    ' x  xx  x ',
  ],
] as const

/** The goal: a cassette with its shell, label, and two reels. */
export const CASSETTE = [
  'xxxxxxxxxxxxxxxxxx',
  'xccccccccccccccccx',
  'xcllllllllllllllcx',
  'xclxxxllllllxxxlcx',
  'xclxrxllllllxrxlcx',
  'xclxxxllllllxxxlcx',
  'xcllllllllllllllcx',
  'xccccccccccccccccx',
  'xcccccxxxxxxcccccx',
  'xccccx      xccccx',
  'xxxxxxxxxxxxxxxxxx',
] as const

export const VIEW_WIDTH = 300
export const VIEW_HEIGHT = 120
export const LEVEL_WIDTH = 900

export const GHOST_WIDTH = GHOST[0].length
const GHOST_HEIGHT = GHOST.length
const NOTE_SIZE = [NOTE[0].length, NOTE.length] as const
const CRACKLE_SIZE = [CRACKLE[0][0].length, CRACKLE[0].length] as const

/** Ground with three pits in it, and four ledges to jump on. */
export const SOLIDS: readonly Box[] = [
  [0, 100, 230, 20],
  [286, 100, 150, 20],
  [500, 100, 120, 20],
  [692, 100, 208, 20],
  [120, 64, 48, 6],
  [330, 58, 40, 6],
  [540, 52, 40, 6],
  [760, 66, 36, 6],
]

export const GOAL: Box = [866, 89, CASSETTE[0].length, CASSETTE.length]

const SPAWN = [16, 100 - GHOST_HEIGHT] as const

/** Where each note sits: on the path, over each pit, and on each ledge. */
const NOTE_SPOTS = [
  [56, 86],
  [140, 44],
  [254, 66],
  [346, 38],
  [464, 64],
  [556, 32],
  [652, 62],
  [774, 46],
] as const

/** Where each crackle patrols, between two left edges, on the ground. */
const PATROLS = [
  [300, 410],
  [710, 830],
] as const

const RUN_SPEED = 110
const MAX_FALL = 600
const CRACKLE_SPEED = 30
const STOMP_BOUNCE = 320

/** How close above a crackle's top the ghost's feet must start to count as a stomp. */
const STOMP_MARGIN = 4

/** How long coyote time and the jump buffer each last, in seconds, when they're on. */
export const GRACE = 0.1

/** Which jump helpers are on. */
export interface Help {
  coyote: boolean
  buffer: boolean
  double: boolean
}

/** A jump in midair starts a little slower than one from the ground, so it reaches about two thirds as high. */
const DOUBLE_JUMP_SPEED = 440

export const LIVES = 3

/** How long the level freezes while the death music plays, in seconds. */
export const DEATH_PAUSE = 1.2

/** What each note, popped crackle, and the cassette add to the score. */
export const POINTS = { note: 100, stomp: 200, win: 1000 } as const

/**
 * The player. `sinceGround` and `sincePress` count seconds since it last
 * stood on something and since jump was last pressed, which is all coyote
 * time and jump buffering need. `airJumps` is how many jumps it has left in
 * midair.
 */
export interface Ghost {
  x: number
  y: number
  vy: number
  sinceGround: number
  sincePress: number
  airJumps: number
}

export interface Crackle {
  x: number
  y: number
  from: number
  to: number
  dir: 1 | -1
  alive: boolean
}

export interface Pickup {
  x: number
  y: number
  got: boolean
}

/**
 * The whole level. `dying` counts down the seconds left in a death, and
 * `over` is true once the last life is gone.
 */
export interface World {
  ghost: Ghost
  crackles: readonly Crackle[]
  notes: readonly Pickup[]
  time: number
  score: number
  lives: number
  dying: number
  won: boolean
  over: boolean
}

/** One frame of input: the stick from -1 to 1, whether jump is down, and whether it just went down. */
export interface Input {
  x: number
  held: boolean
  pressed: boolean
}

export type GameEvent = 'jump' | 'double' | 'note' | 'stomp' | 'hurt' | 'gameover' | 'win'

function spawnGhost(): Ghost {
  return { x: SPAWN[0], y: SPAWN[1], vy: 0, sinceGround: 0, sincePress: Infinity, airJumps: 1 }
}

export function newWorld(): World {
  return {
    ghost: spawnGhost(),
    crackles: PATROLS.map(([from, to]) => ({
      x: from,
      y: 100 - CRACKLE_SIZE[1],
      from,
      to,
      dir: 1,
      alive: true,
    })),
    notes: NOTE_SPOTS.map(([x, y]) => ({ x, y, got: false })),
    time: 0,
    score: 0,
    lives: LIVES,
    dying: 0,
    won: false,
    over: false,
  }
}

/** True when two boxes overlap. Boxes that only touch don't, so standing on the ground isn't a collision. */
function overlaps(a: Box, b: Box): boolean {
  return a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3]
}

function ghostBox({ x, y }: Ghost): Box {
  return [x, y, GHOST_WIDTH, GHOST_HEIGHT]
}

/**
 * Moves the ghost one frame. A jump starts when jump was pressed recently and
 * the ghost stood on something recently. "Recently" means this frame, or
 * within {@link GRACE} with the jump buffer (for the press) or coyote time
 * (for the ground) on. Otherwise, with double jump on, a press in midair
 * spends the ghost's air jump, which landing gives back.
 */
function moveGhost(ghost: Ghost, input: Input, seconds: number, help: Help) {
  let { x, y, vy, sinceGround, sincePress, airJumps } = ghost
  let jump: 'jump' | 'double' | null = null
  if (input.pressed) sincePress = 0
  if (sincePress <= (help.buffer ? GRACE : 0) && sinceGround <= (help.coyote ? GRACE : 0)) {
    vy = -JUMP_SPEED
    sincePress = Infinity
    sinceGround = Infinity
    jump = 'jump'
  } else if (input.pressed && help.double && airJumps > 0) {
    vy = -DOUBLE_JUMP_SPEED
    sincePress = Infinity
    airJumps -= 1
    jump = 'double'
  }
  if (!input.held && vy < -JUMP_CUT) vy = -JUMP_CUT
  vy = Math.min(vy + GRAVITY * seconds, MAX_FALL)

  const vx = input.x * RUN_SPEED
  x = Math.min(Math.max(x + vx * seconds, 0), LEVEL_WIDTH - GHOST_WIDTH)
  for (const solid of SOLIDS) {
    if (overlaps([x, y, GHOST_WIDTH, GHOST_HEIGHT], solid))
      x = vx > 0 ? solid[0] - GHOST_WIDTH : solid[0] + solid[2]
  }

  y += vy * seconds
  let grounded = false
  for (const solid of SOLIDS) {
    if (!overlaps([x, y, GHOST_WIDTH, GHOST_HEIGHT], solid)) continue
    if (vy > 0) {
      y = solid[1] - GHOST_HEIGHT
      grounded = true
    } else y = solid[1] + solid[3]
    vy = 0
  }

  return {
    ghost: {
      x,
      y,
      vy,
      sinceGround: grounded ? 0 : sinceGround + seconds,
      sincePress: sincePress + seconds,
      airJumps: grounded ? 1 : airJumps,
    },
    jump,
  }
}

/** Walks a crackle back and forth between the ends of its patrol. */
function moveCrackle(crackle: Crackle, seconds: number): Crackle {
  if (!crackle.alive) return crackle
  const x = crackle.x + crackle.dir * CRACKLE_SPEED * seconds
  if (x < crackle.from) return { ...crackle, x: crackle.from, dir: 1 }
  if (x > crackle.to) return { ...crackle, x: crackle.to, dir: -1 }
  return { ...crackle, x }
}

/**
 * Moves the whole level forward one frame and reports what happened, so the
 * page can play a sound or rumble for each event. Falling into a pit or
 * touching a crackle from the side costs a life: the level freezes for
 * {@link DEATH_PAUSE}, then the ghost goes back to the start. The last life
 * ends the game. Landing on a crackle pops it.
 */
export function stepWorld(
  world: World,
  input: Input,
  seconds: number,
  help: Help,
): { world: World; events: GameEvent[] } {
  if (world.won || world.over) return { world, events: [] }
  const time = world.time + seconds
  if (world.dying > 0) {
    const dying = Math.max(world.dying - seconds, 0)
    const ghost = dying === 0 ? spawnGhost() : world.ghost
    return { world: { ...world, ghost, time, dying }, events: [] }
  }
  const events: GameEvent[] = []
  const moved = moveGhost(world.ghost, input, seconds, help)
  let ghost = moved.ghost
  if (moved.jump) events.push(moved.jump)
  let score = world.score
  let crackles = world.crackles.map((crackle) => moveCrackle(crackle, seconds))

  const hurt = () => {
    const lives = world.lives - 1
    const over = lives === 0
    events.push(over ? 'gameover' : 'hurt')
    const dying = over ? 0 : DEATH_PAUSE
    return { world: { ...world, crackles, time, lives, dying, over }, events }
  }
  if (ghost.y > VIEW_HEIGHT) return hurt()

  for (const crackle of crackles) {
    if (!crackle.alive || !overlaps(ghostBox(ghost), [crackle.x, crackle.y, ...CRACKLE_SIZE]))
      continue
    if (world.ghost.y + GHOST_HEIGHT > crackle.y + STOMP_MARGIN) return hurt()
    crackles = crackles.map((other) => (other === crackle ? { ...other, alive: false } : other))
    ghost = { ...ghost, vy: -STOMP_BOUNCE, airJumps: 1 }
    score += POINTS.stomp
    events.push('stomp')
  }

  const notes = world.notes.map((note) => {
    if (note.got || !overlaps(ghostBox(ghost), [note.x, note.y, ...NOTE_SIZE])) return note
    score += POINTS.note
    events.push('note')
    return { ...note, got: true }
  })

  const won = overlaps(ghostBox(ghost), GOAL)
  if (won) {
    score += POINTS.win
    events.push('win')
  }
  return { world: { ...world, ghost, crackles, notes, time, score, won }, events }
}
