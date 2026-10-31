// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { claimSpeakers } from '@/components/islands/demo-kit/speakers'
import {
  ControllerDemo,
  describeJump,
  describeRumble,
  formatAxis,
  GameDemo,
  JumpDemo,
} from '@/components/islands/demos/how-to-use-the-gamepad-api/demos'
import styles from '@/components/islands/demos/how-to-use-the-gamepad-api/demos.module.css'
import type * as Game from '@/components/islands/demos/how-to-use-the-gamepad-api/game'
import {
  applyDeadZone,
  getEdges,
  getFirstPad,
  isSamePad,
  jump,
  JUMP_CUT,
  JUMP_SPEED,
  readPad,
  stepJumper,
  useFrame,
  useOnScreen,
  type PadState,
} from '@/components/islands/demos/how-to-use-the-gamepad-api/gamepad'
import { oscillators, stubAudio } from '@/tests/helpers/audio'

/** Where the game's ghost starts, so a test can begin beside the cassette. */
const spawn = vi.hoisted(() => ({
  ghost: null as Partial<Game.Ghost> | null,
  lives: null as number | null,
}))

vi.mock('@/components/islands/demos/how-to-use-the-gamepad-api/game', async (importOriginal) => {
  const actual = await importOriginal<typeof Game>()
  return {
    ...actual,
    newWorld: () => {
      const world = actual.newWorld()
      return {
        ...world,
        lives: spawn.lives ?? world.lives,
        ghost: { ...world.ghost, ...spawn.ghost },
      }
    },
  }
})

let frames: FrameRequestCallback[] = []
let now = 0
let pads: (Gamepad | null)[] = []

/** Runs the queued animation frames, `count` times, 1/60 of a second apart. */
function tick(count = 1) {
  for (let i = 0; i < count; i++) {
    const queued = frames
    frames = []
    now += 1000 / 60
    act(() => {
      for (const callback of queued) callback(now)
    })
  }
}

/** A controller with the given buttons held down and stick positions. */
function fakePad({
  axes = [0, 0, 0, 0],
  down = [],
  mapping = 'standard',
  playEffect,
  values = {},
}: {
  axes?: number[]
  down?: number[]
  mapping?: string
  playEffect?: ReturnType<typeof vi.fn>
  values?: Record<number, number>
} = {}): Gamepad {
  return {
    axes,
    buttons: Array.from({ length: 17 }, (_, i) => ({
      pressed: down.includes(i),
      touched: down.includes(i),
      value: values[i] ?? (down.includes(i) ? 1 : 0),
    })),
    connected: true,
    id: 'Fake pad (STANDARD GAMEPAD)',
    index: 0,
    mapping,
    timestamp: now,
    vibrationActuator: playEffect ? { playEffect } : undefined,
  } as unknown as Gamepad
}

function setActivation(hasBeenActive: boolean | undefined) {
  Object.defineProperty(navigator, 'userActivation', {
    configurable: true,
    value: hasBeenActive === undefined ? undefined : { hasBeenActive },
  })
}

/** Whether the fake IntersectionObserver reports each demo as on screen. */
let onScreen = true
let observers: ((entries: { isIntersecting: boolean }[]) => void)[] = []

class FakeObserver {
  constructor(private readonly callback: (entries: { isIntersecting: boolean }[]) => void) {
    observers.push(callback)
  }
  observe() {
    this.callback([{ isIntersecting: onScreen }])
  }
  disconnect() {}
}

/** Scrolls every demo on or off screen. */
function scrollTo(visible: boolean) {
  onScreen = visible
  act(() => {
    for (const callback of observers) callback([{ isIntersecting: visible }])
  })
}

beforeEach(() => {
  onScreen = true
  observers = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  stubAudio()
  frames = []
  now = 0
  pads = []
  spawn.ghost = null
  spawn.lives = null
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = []
  })
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads })
  setActivation(true)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  oscillators.length = 0
})

describe('gamepad helpers', () => {
  it('never steps backward, even when a frame is stamped before the loop started', () => {
    const onFrame = vi.fn()
    renderHook(() => useFrame(onFrame))
    const queued = frames
    frames = []
    act(() => {
      for (const callback of queued) callback(now - 5)
    })
    tick()
    const steps = onFrame.mock.calls.map(([seconds]) => seconds as number)
    expect(steps[0]).toBe(0)
    expect(steps[1]).toBeCloseTo(0.0217)
  })

  it('reports nothing on screen before there is an element to watch', () => {
    const { result } = renderHook(() => useOnScreen({ current: null }))
    expect(result.current).toBe(false)
  })

  it('finds the first connected controller, skipping empty slots', () => {
    const pad = fakePad()
    pads = [null, pad]
    expect(getFirstPad()).toBe(pad)
    pads = [null]
    expect(getFirstPad()).toBeNull()
  })

  it('finds nothing where the browser has no Gamepad API', () => {
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: undefined })
    expect(getFirstPad()).toBeNull()
  })

  it('copies a frame into plain values', () => {
    const state = readPad(fakePad({ axes: [0.5, -1], down: [0], playEffect: vi.fn() }))
    expect(state.pressed[0]).toBe(true)
    expect(state.buttons[0]).toBe(1)
    expect(state.axes).toEqual([0.5, -1])
    expect(state.canRumble).toBe(true)
    expect(readPad(fakePad()).canRumble).toBe(false)
  })

  it('compares frames by value', () => {
    const a = readPad(fakePad())
    expect(isSamePad(a, readPad(fakePad()))).toBe(true)
    expect(isSamePad(a, readPad(fakePad({ down: [1] })))).toBe(false)
    expect(isSamePad(null, null)).toBe(true)
  })

  it('zeroes small movement and stretches the rest to reach 1', () => {
    expect(applyDeadZone(0.05, 0.05, 0.1)).toEqual([0, 0])
    expect(applyDeadZone(0, 0, 0)).toEqual([0, 0])
    const [x, y] = applyDeadZone(1, 0, 0.1)
    expect(x).toBeCloseTo(1)
    expect(y).toBe(0)
    expect(applyDeadZone(2, 0, 0.1)[0]).toBeCloseTo(1)
  })

  it('finds which buttons went down and came up', () => {
    expect(getEdges([false, true, true], [true, true, false])).toEqual({
      pressed: [0],
      released: [2],
    })
  })

  it('jumps only from the ground and lands back on it', () => {
    const rising = jump({ y: 0, vy: 0 })
    expect(rising.vy).toBe(JUMP_SPEED)
    expect(jump({ y: 10, vy: 5 })).toEqual({ y: 10, vy: 5 })
    let jumper = rising
    for (let i = 0; i < 120; i++) jumper = stepJumper(jumper, true, 1 / 60, true)
    expect(jumper).toEqual({ y: 0, vy: 0 })
  })

  it('cuts a rising jump short when the button comes up, with variable height on', () => {
    const cut = stepJumper({ y: 10, vy: JUMP_SPEED }, false, 0, true)
    expect(cut.vy).toBe(JUMP_CUT)
    const kept = stepJumper({ y: 10, vy: JUMP_SPEED }, false, 0, false)
    expect(kept.vy).toBe(JUMP_SPEED)
  })
})

describe('captions', () => {
  const pad: PadState = {
    axes: [],
    buttons: [],
    canRumble: true,
    id: 'pad',
    mapping: 'standard',
    pressed: [],
  }

  it('formats axes without a negative zero', () => {
    expect(formatAxis(-0.0001)).toBe('0.000')
    expect(formatAxis(-0.25)).toBe('-0.250')
  })

  it('says what rumble can do', () => {
    expect(describeRumble(null)).toMatch(/Press any button/)
    expect(describeRumble({ ...pad, canRumble: false })).toMatch(/Firefox/)
    expect(describeRumble(pad)).toMatch(/Strong drives/)
  })

  it('describes each jump, or why it was silent', () => {
    expect(describeJump(null, true, true)).toMatch(/No sound/)
    expect(describeJump(null, true, false)).toMatch(/Tap it, then hold it/)
    expect(describeJump(40, false, false)).toMatch(/every jump goes the same height/)
    expect(describeJump(40, true, false)).toBe(
      'That jump topped out at 40 px. Tap for a hop, hold for the full jump.',
    )
  })
})

describe('ControllerDemo', () => {
  it('waits for a button press, then shows the controller', () => {
    render(<ControllerDemo />)
    tick()
    expect(screen.getAllByText(/Press any button/)).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Rumble' })).toHaveProperty('disabled', true)

    pads = [fakePad({ axes: [0.5, -0.0001, 0, 0], down: [0], values: { 6: 0.5 } })]
    tick()
    expect(screen.getByText('Fake pad (STANDARD GAMEPAD)')).toBeTruthy()
    expect(screen.getByText('17 buttons')).toBeTruthy()
    expect(screen.getByText('Bottom face')).toBeTruthy()
    expect(screen.getByText('0.500')).toBeTruthy()
    expect(document.querySelectorAll('[data-pressed]').length).toBeGreaterThan(0)
  })

  it('leaves names off a controller without the standard mapping', () => {
    pads = [fakePad({ mapping: '' })]
    render(<ControllerDemo />)
    tick()
    expect(screen.queryByText('Bottom face')).toBeNull()
  })

  it('names buttons past the standard 17 as extras', () => {
    const pad = fakePad()
    pads = [{ ...pad, buttons: [...pad.buttons, { pressed: false, touched: false, value: 0 }] }]
    render(<ControllerDemo />)
    tick()
    expect(screen.getByText('Extra')).toBeTruthy()
  })

  it('rumbles with the slider values', () => {
    const playEffect = vi.fn(async () => 'complete')
    pads = [fakePad({ playEffect })]
    render(<ControllerDemo />)
    tick()
    fireEvent.change(screen.getByRole('slider', { name: 'Strong' }), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rumble' }))
    expect(playEffect).toHaveBeenCalledWith('dual-rumble', {
      duration: 400,
      strongMagnitude: 1,
      weakMagnitude: 0.3,
    })
  })

  it('ignores a rumble the browser refuses', async () => {
    const playEffect = vi.fn(async () => {
      throw new Error('hidden')
    })
    pads = [fakePad({ playEffect })]
    render(<ControllerDemo />)
    tick()
    fireEvent.click(screen.getByRole('button', { name: 'Rumble' }))
    await act(async () => undefined)
    expect(playEffect).toHaveBeenCalled()
  })
})

describe('JumpDemo', () => {
  /** Holds the stage down for `frames` frames, then lets go and waits to land. */
  function jumpFor(stage: HTMLElement, held: number) {
    fireEvent.pointerDown(stage)
    tick(held)
    fireEvent.pointerUp(stage)
    tick(90)
  }

  function lastPeak(): number {
    return Number(/(\d+) px/.exec(document.body.textContent ?? '')?.[1])
  }

  it('hops on a tap and jumps higher on a hold', () => {
    render(<JumpDemo />)
    const stage = screen.getByRole('button', { name: /Jump/ })
    expect(screen.getByText(/Tap it, then hold it/)).toBeTruthy()
    jumpFor(stage, 2)
    const tap = lastPeak()
    jumpFor(stage, 40)
    expect(lastPeak()).toBeGreaterThan(tap * 2)
    expect(oscillators.length).toBeGreaterThan(0)
  })

  it('jumps the same height either way with variable height off', () => {
    render(<JumpDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Variable height' }))
    jumpFor(screen.getByRole('button', { name: /Jump/ }), 2)
    expect(screen.getByText(/every jump goes the same height/)).toBeTruthy()
  })

  it('jumps on Space and ignores other keys and repeats', () => {
    render(<JumpDemo />)
    const stage = screen.getByRole('button', { name: /Jump/ })
    fireEvent.keyDown(stage, { key: 'a' })
    fireEvent.keyUp(stage, { key: 'a' })
    fireEvent.keyDown(stage, { key: ' ', repeat: true })
    tick(90)
    expect(screen.getByText(/Tap it, then hold it/)).toBeTruthy()
    fireEvent.keyDown(stage, { key: ' ' })
    tick(5)
    fireEvent.keyDown(stage, { key: ' ' })
    fireEvent.keyUp(stage, { key: ' ' })
    tick(90)
    expect(screen.getByText(/topped out/)).toBeTruthy()
  })

  it('jumps on the bottom face button, and says why a controller alone is silent', () => {
    setActivation(false)
    render(<JumpDemo />)
    pads = [fakePad({ down: [0] })]
    tick(3)
    pads = [fakePad()]
    tick(90)
    expect(screen.getByText(/No sound/)).toBeTruthy()
  })

  it('ignores the controller while it is off screen', () => {
    onScreen = false
    setActivation(false)
    render(<JumpDemo />)
    pads = [fakePad({ down: [0] })]
    tick(90)
    expect(screen.getByText(/Tap it, then hold it/)).toBeTruthy()
  })

  it('stays quiet about sound where the browser has no user activation API', () => {
    setActivation(undefined)
    render(<JumpDemo />)
    pads = [fakePad({ down: [0] })]
    tick(90)
    expect(screen.queryByText(/No sound/)).toBeNull()
  })

  it('reads a controller with no buttons as nothing pressed', () => {
    render(<JumpDemo />)
    pads = [{ ...fakePad(), buttons: [] } as unknown as Gamepad]
    tick(5)
    expect(screen.getByText(/Tap it, then hold it/)).toBeTruthy()
  })
})

describe('GameDemo', () => {
  function startGame() {
    render(<GameDemo />)
    const stage = screen.getByRole('button', { name: /Play the level/ })
    tick()
    fireEvent.click(stage)
    return stage
  }

  it('waits for a click, then walks, collects, and jumps on the keyboard', () => {
    render(<GameDemo />)
    const stage = screen.getByRole('button', { name: /Play the level/ })
    expect(screen.getByText('Press Start')).toBeTruthy()
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    tick(30)
    expect(screen.getByText(/Grab the notes/)).toBeTruthy()

    fireEvent.click(stage)
    expect(document.activeElement).toBe(stage)
    expect(screen.queryByText('Press Start')).toBeNull()
    expect(screen.queryByText(/Grab the notes/)).toBeNull()
    fireEvent.keyDown(stage, { key: 'q' })
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    tick(30)
    expect(screen.getByText('Score 00100')).toBeTruthy()
    fireEvent.keyUp(stage, { key: 'ArrowRight' })
    fireEvent.keyUp(stage, { key: 'q' })

    const played = oscillators.length
    fireEvent.keyDown(stage, { key: ' ' })
    tick()
    fireEvent.keyDown(stage, { key: ' ', repeat: true })
    fireEvent.keyUp(stage, { key: ' ' })
    tick(60)
    expect(oscillators.length).toBe(played + 2)
  })

  it('starts on Start, and asks for a click while it plays silent', () => {
    setActivation(false)
    render(<GameDemo />)
    tick()
    pads = [fakePad({ down: [9] })]
    tick(2)
    expect(screen.queryByText('Press Start')).toBeNull()
    expect(screen.getByText(/No sound\?/)).toBeTruthy()
    setActivation(true)
    tick()
    expect(screen.queryByText(/No sound\?/)).toBeNull()
  })

  it('starts on the bottom face button too, but not while off screen', () => {
    onScreen = false
    render(<GameDemo />)
    tick()
    pads = [fakePad({ down: [0] })]
    tick(2)
    expect(screen.getByText('Press Start')).toBeTruthy()
    cleanup()
    onScreen = true
    pads = []
    render(<GameDemo />)
    tick()
    pads = [fakePad({ down: [0] })]
    tick(2)
    expect(screen.queryByText('Press Start')).toBeNull()
  })

  it('plays the level music while the ghost is alive, and gives up the speakers to another demo', () => {
    render(<GameDemo />)
    expect(oscillators.some((oscillator) => oscillator.type === 'triangle')).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Play the level/ }))
    expect(oscillators.some((oscillator) => oscillator.type === 'triangle')).toBe(true)
    claimSpeakers({}, () => undefined)
  })

  it('mutes the music and keeps the sound effects', () => {
    render(<GameDemo />)
    const music = screen.getByRole('switch', { name: 'Music' })
    expect(music.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(music)
    expect(music.getAttribute('aria-checked')).toBe('false')
    const stage = screen.getByRole('button', { name: /Play the level/ })
    fireEvent.click(stage)
    expect(oscillators.some((oscillator) => oscillator.type === 'triangle')).toBe(false)
    fireEvent.keyDown(stage, { key: ' ' })
    tick()
    expect(oscillators.length).toBeGreaterThan(0)
    fireEvent.click(music)
    expect(document.activeElement).toBe(stage)
    expect(oscillators.some((oscillator) => oscillator.type === 'triangle')).toBe(true)
  })

  it('pauses while scrolled off screen', () => {
    const stage = startGame()
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    scrollTo(false)
    tick(30)
    expect(screen.getByText('Score 00000')).toBeTruthy()
    scrollTo(true)
    tick(30)
    expect(screen.getByText('Score 00100')).toBeTruthy()
  })

  it('drops held keys when the box loses focus', () => {
    const stage = startGame()
    fireEvent.keyDown(stage, { key: 'd' })
    fireEvent.blur(stage)
    tick(30)
    expect(screen.getByText('Score 00000')).toBeTruthy()
  })

  it('walks on the stick and d-pad, and rumbles on a fall', () => {
    const playEffect = vi.fn(async () => 'complete')
    startGame()
    pads = [fakePad({ axes: [1, 0, 0, 0], playEffect })]
    tick(60)
    pads = [fakePad({ down: [15], playEffect })]
    tick(80)
    expect(playEffect).toHaveBeenCalledWith('dual-rumble', {
      duration: 300,
      strongMagnitude: 1,
      weakMagnitude: 0.6,
    })
    tick(80)
    expect(screen.getByText('Lives 2')).toBeTruthy()
  })

  it('plays the game over music on the last life, then starts over', () => {
    spawn.ghost = { x: 285 }
    spawn.lives = 1
    const stage = startGame()
    expect(screen.getByText('Lives 1')).toBeTruthy()
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    tick()
    expect(screen.getByText('Game over')).toBeTruthy()
    expect(screen.getByText(/Game over, with 0 points/)).toBeTruthy()
    fireEvent.click(stage)
    expect(screen.getByText('Lives 1')).toBeTruthy()
    tick()
    expect(screen.getByText('Game over')).toBeTruthy()
    fireEvent.keyUp(stage, { key: 'ArrowRight' })
    pads = [fakePad({ down: [9] })]
    tick()
    expect(screen.getByText('Lives 1')).toBeTruthy()
  })

  it('pops a crackle landed on, with a short rumble', () => {
    const playEffect = vi.fn(async () => 'complete')
    pads = [fakePad({ playEffect })]
    spawn.ghost = { x: 298, y: 74, vy: 200, sinceGround: 1 }
    startGame()
    const crackles = () => document.querySelectorAll(`.${styles.static}`).length
    expect(crackles()).toBe(2)
    tick()
    expect(crackles()).toBe(1)
    expect(playEffect).toHaveBeenCalledWith('dual-rumble', {
      duration: 120,
      strongMagnitude: 0.7,
      weakMagnitude: 0.2,
    })
  })

  it('jumps again in midair with double jump on', () => {
    render(<GameDemo />)
    fireEvent.click(screen.getByRole('switch', { name: 'Double jump' }))
    const stage = screen.getByRole('button', { name: /Play the level/ })
    fireEvent.click(stage)
    const played = oscillators.length
    fireEvent.keyDown(stage, { key: ' ' })
    tick(10)
    fireEvent.keyUp(stage, { key: ' ' })
    fireEvent.keyDown(stage, { key: ' ' })
    tick()
    expect(oscillators.length).toBe(played + 5)
  })

  it('jumps on the bottom face button', () => {
    startGame()
    const played = oscillators.length
    pads = [fakePad({ down: [0] })]
    tick(2)
    expect(oscillators.length).toBe(played + 2)
  })

  it('finds the tape, then plays again on Start or a click', () => {
    spawn.ghost = { x: 846 }
    const stage = startGame()
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    tick(10)
    fireEvent.keyUp(stage, { key: 'ArrowRight' })
    expect(screen.getByText('Tape found!')).toBeTruthy()
    expect(screen.getByText(/with every switch off/)).toBeTruthy()

    tick()
    pads = [fakePad({ down: [9] })]
    tick()
    expect(screen.getByText('Score 00000')).toBeTruthy()

    fireEvent.click(screen.getByRole('switch', { name: 'Coyote time' }))
    expect(document.activeElement).toBe(stage)
    fireEvent.click(screen.getByRole('switch', { name: 'Jump buffering' }))
    expect(document.activeElement).toBe(stage)
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    tick(10)
    fireEvent.keyUp(stage, { key: 'ArrowRight' })
    expect(screen.getByText(/notes\. Press Start or click the box to play again\./)).toBeTruthy()

    fireEvent.click(stage)
    expect(screen.getByText('Score 00000')).toBeTruthy()
    fireEvent.click(stage)
    expect(screen.getByText('Score 00000')).toBeTruthy()
  })

  it('leaves focus alone when a switch flips before the game starts', () => {
    render(<GameDemo />)
    const toggle = screen.getByRole('switch', { name: 'Coyote time' })
    toggle.focus()
    fireEvent.click(toggle)
    expect(document.activeElement).toBe(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })
})
