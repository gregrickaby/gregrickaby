'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { GHOST } from '@/components/ghost'
import { startChiptune } from '@/components/islands/chiptune'
import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'
import { playNotes, type Note, type PlayOptions } from '@/components/islands/sounds'

import styles from './demos.module.css'
import {
  CASSETTE,
  CRACKLE,
  GHOST_WIDTH,
  GOAL,
  LEVEL_WIDTH,
  newWorld,
  NOTE,
  SOLIDS,
  stepWorld,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type GameEvent,
  type Help,
  type World,
} from './game'
import {
  applyDeadZone,
  BUTTON_NAMES,
  getEdges,
  getFirstPad,
  isGrounded,
  jump,
  stepJumper,
  useFrame,
  useOnScreen,
  usePad,
  type Jumper,
  type PadState,
} from './gamepad'
import { LEVEL_SONG } from './music'

/** The class that colors each kind of pixel in the sprites. */
const PIXELS: Record<string, string | undefined> = {
  x: styles.outline,
  '#': styles.sheet,
  o: styles.eye,
  b: styles.blush,
  n: styles.note,
  s: styles.static,
  c: styles.shell,
  l: styles.label,
  r: styles.reel,
}

/**
 * One path per color, with each row's runs of a pixel merged into a single
 * rectangle, so a sprite is a handful of elements instead of hundreds.
 */
function toPaths(art: readonly string[]): [pixel: string, d: string][] {
  const paths = new Map<string, string>()
  for (const [top, row] of art.entries()) {
    for (const match of row.matchAll(/(\S)\1*/g)) {
      const run = match[0]
      const pixel = run.charAt(0)
      paths.set(
        pixel,
        `${paths.get(pixel) ?? ''}M${match.index} ${top}h${run.length}v1h-${run.length}z`,
      )
    }
  }
  return [...paths]
}

/** Pixel art from rows of characters, with its top-left corner at `x`, `y`. */
function Sprite({ art, x, y }: { art: readonly string[]; x: number; y: number }) {
  return (
    <g shapeRendering="crispEdges" transform={`translate(${Math.round(x)} ${Math.round(y)})`}>
      {toPaths(art).map(([pixel, d]) => (
        <path className={PIXELS[pixel]} d={d} key={pixel} />
      ))}
    </g>
  )
}

/** An axis value with three decimals, without the `-0.000` that rounding leaves behind. */
export function formatAxis(value: number): string {
  const text = value.toFixed(3)
  return text === '-0.000' ? '0.000' : text
}

/** A face, d-pad, or center button: where it sits and how it's drawn. */
const ROUND_BUTTONS: readonly (readonly [index: number, x: number, y: number, r: number])[] = [
  [0, 166, 80, 6],
  [1, 180, 66, 6],
  [2, 152, 66, 6],
  [3, 166, 52, 6],
  [8, 107, 58, 4],
  [9, 133, 58, 4],
  [16, 120, 76, 6],
]

const DPAD: readonly (readonly [index: number, x: number, y: number])[] = [
  [12, 69, 49],
  [13, 69, 71],
  [14, 58, 60],
  [15, 80, 60],
]

/** A stick: the axes it reads, the button it clicks, and its center. */
const STICKS: readonly (readonly [x: number, y: number, press: number, cx: number])[] = [
  [0, 1, 10, 94],
  [2, 3, 11, 146],
]

/**
 * A made-up controller in the standard layout, lit by the live state:
 * buttons fill as they're pressed, triggers fill as far as they're pulled,
 * and each stick's cap follows the stick.
 */
function Diagram({ pad }: { pad: PadState | null }) {
  const value = (index: number) => pad?.buttons[index] ?? 0
  const on = (index: number) => pad?.pressed[index] || undefined
  return (
    <svg aria-hidden="true" className={styles.diagram} viewBox="20 0 200 150">
      <path
        className={styles.body}
        d="M72 32H168Q200 32 206 72L213 118Q216 140 200 142Q187 144 176 124L165 108H75L64 124Q53 144 40 142Q24 140 27 118L34 72Q40 32 72 32Z"
      />
      {[6, 7].map((index) => {
        const x = index === 6 ? 53 : 157
        const fill = 14 * value(index)
        return (
          <g key={index}>
            <rect className={styles.key} height="14" rx="2" width="30" x={x} y="2" />
            <rect className={styles.fill} height={fill} width="30" x={x} y={16 - fill} />
          </g>
        )
      })}
      {[4, 5].map((index) => (
        <rect
          className={styles.key}
          data-pressed={on(index)}
          height="8"
          key={index}
          rx="3"
          width="34"
          x={index === 4 ? 51 : 155}
          y="20"
        />
      ))}
      {DPAD.map(([index, x, y]) => (
        <rect
          className={styles.key}
          data-pressed={on(index)}
          height="11"
          key={index}
          width="11"
          x={x}
          y={y}
        />
      ))}
      {ROUND_BUTTONS.map(([index, x, y, r]) => (
        <circle className={styles.key} cx={x} cy={y} data-pressed={on(index)} key={index} r={r} />
      ))}
      {STICKS.map(([xAxis, yAxis, press, cx]) => (
        <g key={press}>
          <circle className={styles.well} cx={cx} cy="100" r="15" />
          <circle
            className={styles.key}
            cx={cx + 8 * (pad?.axes[xAxis] ?? 0)}
            cy={100 + 8 * (pad?.axes[yAxis] ?? 0)}
            data-pressed={on(press)}
            r="9"
          />
        </g>
      ))}
    </svg>
  )
}

/** What the rumble controls say, depending on what the browser and controller can do. */
export function describeRumble(pad: PadState | null): string {
  if (!pad) return 'Press any button on your controller to wake it up.'
  if (!pad.canRumble)
    return "This browser can't rumble a controller. Chrome and Safari can; Firefox can't yet."
  return 'Strong drives the big, slow motor in the left grip. Weak drives the small, buzzy one in the right.'
}

/** Rumbles the first controller, where the browser can. A refused rumble is ignored. */
function playRumble(duration: number, strong: number, weak: number) {
  getFirstPad()
    ?.vibrationActuator?.playEffect('dual-rumble', {
      duration,
      strongMagnitude: strong,
      weakMagnitude: weak,
    })
    .catch(() => undefined)
}

/**
 * A live readout of the first controller: its name and mapping, a diagram
 * that lights up, every raw value, and rumble motors to try.
 */
export function ControllerDemo() {
  const pad = usePad()
  const [strong, setStrong] = useState(60)
  const [weak, setWeak] = useState(30)
  const standard = pad?.mapping === 'standard'

  return (
    <>
      <div className={styles.status} data-connected={pad ? true : undefined}>
        <span className={styles.light} />
        {pad ? (
          <span className={styles.id}>{pad.id}</span>
        ) : (
          <span>Press any button on your controller.</span>
        )}
      </div>
      {pad ? (
        <ul className={styles.chips}>
          <li>
            mapping: <code>&quot;{pad.mapping}&quot;</code>
          </li>
          <li>{pad.buttons.length} buttons</li>
          <li>{pad.axes.length} axes</li>
        </ul>
      ) : null}
      <Diagram pad={pad} />
      {pad ? (
        <div className={styles.raw}>
          <ol aria-label="Buttons" className={styles.values}>
            {pad.buttons.map((value, i) => (
              <li data-pressed={pad.pressed[i] || undefined} key={`button-${i}`}>
                <code>buttons[{i}]</code>
                <span className={styles.name}>{standard ? (BUTTON_NAMES[i] ?? 'Extra') : ''}</span>
                <span className={styles.number}>{value.toFixed(2)}</span>
              </li>
            ))}
          </ol>
          <ol aria-label="Axes" className={styles.values}>
            {pad.axes.map((value, i) => (
              <li key={`axis-${i}`}>
                <code>axes[{i}]</code>
                <span className={styles.number}>{formatAxis(value)}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <Controls label="Rumble">
        <Slider label="Strong" max={100} min={0} onChange={setStrong} value={strong} />
        <Slider label="Weak" max={100} min={0} onChange={setWeak} value={weak} />
        <DemoButton
          disabled={!pad?.canRumble}
          onClick={() => playRumble(400, strong / 100, weak / 100)}
        >
          Rumble
        </DemoButton>
      </Controls>
      <Caption>{describeRumble(pad)}</Caption>
    </>
  )
}

/** An original hop: two quick notes up a fifth. */
const JUMP_SOUND: readonly Note[] = [
  [392, 0.03],
  [587, 0.07],
]

/** What a demo says when a controller started it before the page had a click. */
const SILENT_HINT =
  "No sound? Browsers won't play audio until you click, tap, or press a key on the page, and controller buttons don't count. Click the box once."

/** What the jump demo says after each landing, or about missing sound. */
export function describeJump(peak: number | null, variable: boolean, silent: boolean): string {
  if (silent) return SILENT_HINT
  if (peak === null) return 'Press the bottom face button, Space, or the box. Tap it, then hold it.'
  if (!variable) return `${peak} px. Variable height is off, so every jump goes the same height.`
  return `That jump topped out at ${peak} px. Tap for a hop, hold for the full jump.`
}

const GROUND: Jumper = { y: 0, vy: 0 }

const JUMP_KEYS = new Set([' ', 'ArrowUp', 'Enter'])

/**
 * A ghost that jumps on the bottom face button, Space, or a press of the
 * box. With variable height on, letting go early cuts the jump short.
 */
export function JumpDemo() {
  const stage = useRef<HTMLButtonElement>(null)
  const onScreen = useOnScreen(stage)
  const body = useRef<Jumper>(GROUND)
  const highest = useRef(0)
  const padWasDown = useRef(false)
  const otherDown = useRef(false)
  const [height, setHeight] = useState(0)
  const [peak, setPeak] = useState<number | null>(null)
  const [variable, setVariable] = useState(true)
  const [silent, setSilent] = useState(false)

  function start(fromPad: boolean) {
    if (!isGrounded(body.current)) return
    body.current = jump(body.current)
    highest.current = 0
    playNotes(JUMP_SOUND)
    setSilent(fromPad && navigator.userActivation?.hasBeenActive === false)
  }

  useFrame((seconds) => {
    const padDown = onScreen && (getFirstPad()?.buttons[0]?.pressed ?? false)
    if (padDown && !padWasDown.current) start(true)
    padWasDown.current = padDown
    const before = body.current
    const next = stepJumper(before, padDown || otherDown.current, seconds, variable)
    highest.current = Math.max(highest.current, next.y)
    if (!isGrounded(before) && isGrounded(next)) setPeak(Math.round(highest.current))
    body.current = next
    setHeight(next.y)
  })

  function press() {
    otherDown.current = true
    start(false)
  }

  function release() {
    otherDown.current = false
  }

  function keyDown(event: KeyboardEvent) {
    if (!JUMP_KEYS.has(event.key)) return
    event.preventDefault()
    if (!event.repeat) press()
  }

  function keyUp(event: KeyboardEvent) {
    if (JUMP_KEYS.has(event.key)) release()
  }

  return (
    <>
      <button
        aria-label="Jump. Hold for a higher jump."
        className={styles.stage}
        onKeyDown={keyDown}
        onKeyUp={keyUp}
        onPointerCancel={release}
        onPointerDown={press}
        onPointerLeave={release}
        onPointerUp={release}
        ref={stage}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 300 110">
          <line className={styles.ground} x1="0" x2="300" y1="100" y2="100" />
          <ellipse
            className={styles.shadow}
            cx="150"
            cy="101"
            rx={8 * (1 - Math.min(height, 100) / 150)}
            ry="1.5"
          />
          <Sprite art={GHOST} x={142} y={85 - height} />
        </svg>
      </button>
      <Controls>
        <DemoButton
          aria-pressed={variable}
          onClick={() => setVariable((current) => !current)}
          variant="secondary"
        >
          Variable height
        </DemoButton>
      </Controls>
      <Caption>{describeJump(peak, variable, silent)}</Caption>
    </>
  )
}

/**
 * What each event in the level sounds like, and how it rumbles. All
 * original; the cassette's sting uses rounded square waves for a softer,
 * lo-fi sound.
 */
const EFFECTS: Record<
  GameEvent,
  {
    notes: readonly Note[]
    options?: PlayOptions
    rumble?: readonly [ms: number, strong: number, weak: number]
  }
> = {
  jump: { notes: JUMP_SOUND },
  /** The hop again, a step higher, with a third note on top. */
  double: {
    notes: [
      [587, 0.03],
      [880, 0.03],
      [1175, 0.07],
    ],
  },
  note: {
    notes: [
      [784, 0.04],
      [1047, 0.04],
      [1568, 0.1],
    ],
  },
  stomp: {
    notes: [
      ['noise', 0.05],
      [147, 0.08],
    ],
    rumble: [120, 0.7, 0.2],
  },
  /** Death music: three stumbling steps down, then a slow slide that lasts the whole pause. */
  hurt: {
    notes: [
      [523, 0.1],
      ['rest', 0.05],
      [494, 0.1],
      ['rest', 0.05],
      [466, 0.1],
      ['rest', 0.05],
      [440, 0.15],
      [415, 0.15],
      [392, 0.45],
    ],
    rumble: [300, 1, 0.6],
  },
  /** The same idea for the last life, slower, lower, and softer. */
  gameover: {
    notes: [
      [392, 0.3],
      ['rest', 0.05],
      [311, 0.3],
      ['rest', 0.05],
      [262, 0.3],
      ['rest', 0.05],
      [247, 0.25],
      [233, 0.25],
      [196, 0.7],
    ],
    options: { harmonics: 3 },
    rumble: [600, 1, 1],
  },
  win: {
    notes: [
      [523, 0.12],
      [659, 0.12],
      [784, 0.12],
      [988, 0.12],
      [1047, 0.5],
    ],
    options: { harmonics: 3 },
  },
}

const GAME_KEYS: Record<string, 'left' | 'right' | 'jump' | undefined> = {
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ' ': 'jump',
  ArrowUp: 'jump',
  w: 'jump',
}

/** How far the stick has to move before the ghost walks. */
const DEAD_ZONE = 0.25

/** An on/off switch with a one-line hint under its label. */
function Switch({
  checked,
  hint,
  label,
  onChange,
}: {
  checked: boolean
  hint: string
  label: string
  onChange: () => void
}) {
  const id = useId()
  return (
    <button
      aria-checked={checked}
      aria-describedby={id}
      aria-label={label}
      className={styles.switch}
      onClick={onChange}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" className={styles.track}>
        <span className={styles.knob} />
      </span>
      <span className={styles.switchLabel}>{label}</span>
      <span className={styles.hint} id={id}>
        {hint}
      </span>
    </button>
  )
}

/** What the level says before and after a run. During one, the score along the top says it all. */
export function describeGame(
  playing: boolean,
  world: World,
  help: Help,
  silent: boolean,
): string | null {
  const got = world.notes.filter((note) => note.got).length
  const notes = `${got} of ${world.notes.length} notes`
  const score = `${world.score.toLocaleString('en-US')} points`
  if (!playing)
    return 'Move with the stick or d-pad and jump with the bottom button (or use the arrow keys and Space). Grab the notes, stomp the static, and find the cassette tape.'
  if (world.over)
    return `Game over, with ${score} and ${notes}. Press Start or click the box to start over.`
  if (!world.won) return silent ? SILENT_HINT : null
  const result = `Tape found in ${world.time.toFixed(1)} seconds, with ${score} and ${notes}`
  return help.coyote || help.buffer || help.double
    ? `${result}. Press Start or click the box to play again.`
    : `${result}, with every switch off. Press Start or click the box to play again.`
}

/**
 * A one-level platformer: walk right, collect notes, stomp the static, and
 * find the cassette. It starts on a click, Start, or the bottom face button,
 * and takes the keyboard once the box has focus. It pauses while it's off
 * screen, so a crackle can't take a life from a reader who scrolled away.
 * Since a controller can't unlock sound, it asks for a click when it's
 * playing silent.
 */
export function GameDemo() {
  const stage = useRef<HTMLButtonElement>(null)
  const onScreen = useOnScreen(stage)
  const [shown, setShown] = useState(newWorld)
  const world = useRef(shown)
  const held = useRef(new Set<string>())
  const tapped = useRef(false)
  const padBefore = useRef<readonly boolean[]>([])
  const [playing, setPlaying] = useState(false)
  const [help, setHelp] = useState<Help>({ coyote: false, buffer: false, double: false })
  const [musicOn, setMusicOn] = useState(true)
  const [silent, setSilent] = useState(false)

  function restart() {
    world.current = newWorld()
    setShown(world.current)
  }

  /**
   * The level's music plays while the ghost is alive, and stops for the death
   * music, game over, and the cassette's sting. A death starts it over from
   * the top. A page with no click yet can't play it, so it starts once the
   * reader clicks. The Music switch turns it off and leaves the sound
   * effects on. Scrolling the level away pauses it, music and all.
   */
  const alive = playing && onScreen && !shown.won && !shown.over && shown.dying === 0
  useEffect(() => {
    if (!alive || !musicOn) return
    const music = startChiptune(
      LEVEL_SONG,
      () => LEVEL_SONG.bpm,
      () => undefined,
    )
    claimSpeakers(stage, () => music?.stop())
    return () => {
      music?.stop()
      releaseSpeakers(stage)
    }
  }, [alive, musicOn, silent])

  function startOrRestart() {
    stage.current?.focus()
    if (!playing) setPlaying(true)
    else if (world.current.won || world.current.over) restart()
  }

  useFrame((seconds) => {
    const pad = onScreen ? getFirstPad() : null
    const pressed = pad?.buttons.map((button) => button.pressed) ?? []
    const edges = getEdges(padBefore.current, pressed).pressed
    padBefore.current = pressed
    const muted = navigator.userActivation?.hasBeenActive === false
    if (muted !== silent) setSilent(muted)
    if (!playing) {
      if (edges.includes(9) || edges.includes(0)) setPlaying(true)
      return
    }
    if (!onScreen) return
    if (world.current.won || world.current.over) {
      if (edges.includes(9)) restart()
      return
    }
    const keys = held.current
    const [stick] = applyDeadZone(pad?.axes[0] ?? 0, pad?.axes[1] ?? 0, DEAD_ZONE)
    const steer =
      stick +
      Number(pressed[15] === true) -
      Number(pressed[14] === true) +
      Number(keys.has('right')) -
      Number(keys.has('left'))
    const input = {
      x: Math.min(Math.max(steer, -1), 1),
      held: pressed[0] === true || keys.has('jump'),
      pressed: edges.includes(0) || tapped.current,
    }
    tapped.current = false
    const step = stepWorld(world.current, input, seconds, help)
    world.current = step.world
    for (const event of step.events) {
      const { notes, options, rumble } = EFFECTS[event]
      playNotes(notes, options)
      if (rumble) playRumble(...rumble)
    }
    setShown(step.world)
  })

  function keyDown(event: KeyboardEvent) {
    const key = GAME_KEYS[event.key]
    if (!key || !playing) return
    event.preventDefault()
    if (key === 'jump' && !event.repeat) tapped.current = true
    held.current.add(key)
  }

  function keyUp(event: KeyboardEvent) {
    const key = GAME_KEYS[event.key]
    if (key) held.current.delete(key)
  }

  /** Hands the keyboard back to the level after a switch takes focus mid-game. */
  function refocus() {
    if (playing) stage.current?.focus()
  }

  function toggle(name: keyof Help) {
    setHelp((current) => ({ ...current, [name]: !current[name] }))
    refocus()
  }

  function toggleMusic() {
    setMusicOn((current) => !current)
    refocus()
  }

  const { ghost } = shown
  const camera = Math.min(
    Math.max(ghost.x + GHOST_WIDTH / 2 - VIEW_WIDTH / 2, 0),
    LEVEL_WIDTH - VIEW_WIDTH,
  )
  const caption = describeGame(playing, shown, help, silent)
  const flicker = shown.time % 0.2 < 0.1
  const crackle = flicker ? CRACKLE[0] : CRACKLE[1]

  return (
    <>
      <button
        aria-label="Play the level. Move with the arrow keys and jump with Space."
        className={styles.stage}
        onBlur={() => held.current.clear()}
        onClick={startOrRestart}
        onKeyDown={keyDown}
        onKeyUp={keyUp}
        ref={stage}
        type="button"
      >
        <svg aria-hidden="true" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
          <g transform={`translate(${-Math.round(camera)} 0)`}>
            {SOLIDS.map(([x, y, width, height]) => (
              <rect
                className={styles.solid}
                height={height}
                key={`${x}-${y}`}
                width={width}
                x={x}
                y={y}
              />
            ))}
            {shown.notes.map((note) =>
              note.got ? null : <Sprite art={NOTE} key={note.x} x={note.x} y={note.y} />,
            )}
            {shown.crackles.map((enemy) =>
              enemy.alive ? (
                <Sprite art={crackle} key={enemy.from} x={enemy.x} y={enemy.y} />
              ) : null,
            )}
            <Sprite art={CASSETTE} x={GOAL[0]} y={GOAL[1]} />
            {shown.dying > 0 && flicker ? null : <Sprite art={GHOST} x={ghost.x} y={ghost.y} />}
          </g>
          <text className={styles.hud} x="6" y="12">
            {`Score ${String(shown.score).padStart(5, '0')}`}
          </text>
          <text className={styles.hud} textAnchor="end" x={VIEW_WIDTH - 6} y="12">
            {`Lives ${shown.lives}`}
          </text>
          {playing && !shown.won && !shown.over ? null : (
            <>
              <rect className={styles.dim} height={VIEW_HEIGHT} width={VIEW_WIDTH} />
              <text className={styles.banner} x={VIEW_WIDTH / 2} y={VIEW_HEIGHT / 2}>
                {playing ? (shown.won ? 'Tape found!' : 'Game over') : 'Press Start'}
              </text>
            </>
          )}
        </svg>
      </button>
      <div className={styles.switches}>
        <Switch
          checked={help.coyote}
          hint="Jump just after leaving a ledge"
          label="Coyote time"
          onChange={() => toggle('coyote')}
        />
        <Switch
          checked={help.buffer}
          hint="Press jump just before landing"
          label="Jump buffering"
          onChange={() => toggle('buffer')}
        />
        <Switch
          checked={help.double}
          hint="One more jump in midair"
          label="Double jump"
          onChange={() => toggle('double')}
        />
        <Switch
          checked={musicOn}
          hint="Sound effects stay on"
          label="Music"
          onChange={toggleMusic}
        />
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </>
  )
}
