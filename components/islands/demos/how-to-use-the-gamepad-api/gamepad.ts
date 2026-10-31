import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * What each button does in the standard mapping, by index. Face buttons go
 * by position, since an Xbox A is a PlayStation Cross is a Switch B.
 */
export const BUTTON_NAMES = [
  'Bottom face',
  'Right face',
  'Left face',
  'Top face',
  'Left bumper',
  'Right bumper',
  'Left trigger',
  'Right trigger',
  'Select',
  'Start',
  'Left stick press',
  'Right stick press',
  'D-pad up',
  'D-pad down',
  'D-pad left',
  'D-pad right',
  'Home',
] as const

/** A plain copy of one frame of a controller, so React can compare frames. */
export interface PadState {
  id: string
  mapping: string
  buttons: readonly number[]
  pressed: readonly boolean[]
  axes: readonly number[]
  canRumble: boolean
}

/**
 * The first connected controller, or null. Browsers list none until the
 * visitor presses a button, and some fill empty slots with null.
 */
export function getFirstPad(): Gamepad | null {
  if (typeof navigator.getGamepads !== 'function') return null
  return navigator.getGamepads().find((pad) => pad?.connected) ?? null
}

export function readPad(pad: Gamepad): PadState {
  return {
    id: pad.id,
    mapping: pad.mapping,
    buttons: pad.buttons.map((button) => button.value),
    pressed: pad.buttons.map((button) => button.pressed),
    axes: [...pad.axes],
    canRumble: typeof pad.vibrationActuator?.playEffect === 'function',
  }
}

/** True when two frames match, so an idle controller doesn't re-render 60 times a second. */
export function isSamePad(a: PadState | null, b: PadState | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Calls `onFrame` on every animation frame with the seconds since the last
 * one, capped so a background tab coming back doesn't teleport anything. A
 * frame's timestamp can come from before the effect ran, so the first step
 * floors at zero.
 */
export function useFrame(onFrame: (seconds: number) => void) {
  const latest = useRef(onFrame)
  useEffect(() => {
    latest.current = onFrame
  })
  useEffect(() => {
    let last = performance.now()
    let frame = requestAnimationFrame(tick)
    function tick(now: number) {
      latest.current(Math.min(Math.max(now - last, 0) / 1000, 0.05))
      last = now
      frame = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frame)
  }, [])
}

/**
 * True while at least half of an element is on screen. A demo that acts on a
 * button press checks it, so a controller only drives the demo the reader is
 * looking at, not every demo on the page at once.
 */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

/** The first controller, polled every frame. There are no button events to listen for. */
export function usePad(): PadState | null {
  const [pad, setPad] = useState<PadState | null>(null)
  useFrame(() => {
    const live = getFirstPad()
    const next = live ? readPad(live) : null
    setPad((current) => (isSamePad(current, next) ? current : next))
  })
  return pad
}

/**
 * Ignores stick movement smaller than `size` (0 to 1) in any direction, then
 * stretches the rest so the stick still reaches 1.
 */
export function applyDeadZone(x: number, y: number, size: number): [x: number, y: number] {
  const distance = Math.hypot(x, y)
  if (distance === 0 || distance < size) return [0, 0]
  const scale = (Math.min(distance, 1) - size) / (1 - size) / distance
  return [x * scale, y * scale]
}

/** Which buttons went down and which came up since the last frame. */
export function getEdges(
  before: readonly boolean[],
  after: readonly boolean[],
): { pressed: number[]; released: number[] } {
  const pressed: number[] = []
  const released: number[] = []
  for (const [i, down] of after.entries()) {
    if (down && !before[i]) pressed.push(i)
    if (!down && before[i]) released.push(i)
  }
  return { pressed, released }
}

/** Height above the ground and speed, in pixels and pixels per second. Up is positive. */
export interface Jumper {
  y: number
  vy: number
}

export const GRAVITY = 1800
export const JUMP_SPEED = 520

/** How fast a jump can still be rising once the button comes up. */
export const JUMP_CUT = 160

export function isGrounded(jumper: Jumper): boolean {
  return jumper.y === 0 && jumper.vy === 0
}

/** Starts a jump from the ground. In the air, nothing happens. */
export function jump(jumper: Jumper): Jumper {
  return isGrounded(jumper) ? { y: 0, vy: JUMP_SPEED } : jumper
}

/**
 * Moves a jumper forward in time. With `variable` on, letting go of the
 * button on the way up cuts the jump short, so a tap is a hop and a hold is
 * a full jump.
 */
export function stepJumper(
  jumper: Jumper,
  held: boolean,
  seconds: number,
  variable: boolean,
): Jumper {
  let vy = jumper.vy
  if (variable && !held && vy > JUMP_CUT) vy = JUMP_CUT
  vy -= GRAVITY * seconds
  const y = jumper.y + vy * seconds
  return y <= 0 ? { y: 0, vy: 0 } : { y, vy }
}
