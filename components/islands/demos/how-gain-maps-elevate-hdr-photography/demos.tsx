'use client'

import Image from 'next/image'
import { useId, useState, useSyncExternalStore, type CSSProperties } from 'react'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { playNotes, playSound, soundEnabled } from '@/components/islands/sounds'

import styles from './demos.module.css'
import { CHART_HEIGHT, coverage, LOCUS, paintChart, SPACES, type Point, type Space } from './gamut'
import { CAPACITY_MAX, HDR, OFFSET, SDR } from './scanline'

const BASE = '/content/posts/how-gain-maps-elevate-hdr-photography'

/** A short blip at `pitch` hertz, when the visitor turned sounds on. Sliders tick with it. */
export function blip(pitch: number) {
  if (soundEnabled()) playNotes([[pitch, 0.03]])
}

const SCREEN_QUERIES = ['(dynamic-range: high)', '(color-gamut: p3)', '(color-gamut: rec2020)']

function subscribeToScreen(onChange: () => void) {
  const lists = SCREEN_QUERIES.map((query) => matchMedia(query))
  for (const list of lists) list.addEventListener('change', onChange)
  return () => {
    for (const list of lists) list.removeEventListener('change', onChange)
  }
}

function subscribeNever() {
  return () => {}
}

/**
 * Whether a media query matches, kept up to date (dragging the window to
 * another screen changes `dynamic-range`). `null` on the server.
 */
function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    subscribeToScreen,
    () => matchMedia(query).matches,
    () => null,
  )
}

/** The widest color space this screen shows, or `null` on the server. */
function useScreenGamut(): Space | null {
  const p3 = useMediaQuery('(color-gamut: p3)')
  const rec2020 = useMediaQuery('(color-gamut: rec2020)')
  if (p3 === null) return null
  return rec2020 ? 'rec2020' : p3 ? 'p3' : 'srgb'
}

/** Firefox can't read gain maps yet; Firefox on iOS uses WebKit and can. */
export function isFirefox(userAgent: string): boolean {
  return userAgent.includes('Firefox/')
}

/** The verdict under the screen check, for what this screen and browser can show. */
export function describeScreen(hdr: boolean, firefox: boolean): string {
  if (firefox)
    return hdr
      ? "Your screen can do HDR, but Firefox doesn't read gain maps yet. Open this post in Chrome, Edge, or Safari to see the difference."
      : "Firefox doesn't read gain maps yet, so you'll see the SDR version of every photo below. They're still the right photos, just without the glow."
  return hdr
    ? "You're all set. The HDR photos below will glow brighter than this page's white."
    : "You'll see the SDR version of every photo below. They're still the right photos, just without the glow."
}

const GAMUT_NAMES: Record<Space, string> = {
  rec2020: 'Rec. 2020',
  p3: 'Display P3',
  srgb: 'sRGB only',
}

/**
 * What the screen check shows before the browser answers, the same size as
 * the answer so nothing jumps when it arrives.
 */
const PENDING = [
  { label: 'HDR brightness', value: 'Squinting' },
  { label: 'Wide color', value: 'Counting crayons' },
  { label: 'Gain maps', value: 'Sniffing' },
]

const CHECKING =
  'Checking your screen. Hold still while I ask your graphics card a few personal questions.'

/** Every caption the screen check can show, stacked so the slot fits the longest. */
const VERDICTS = [
  CHECKING,
  describeScreen(true, false),
  describeScreen(false, false),
  describeScreen(true, true),
  describeScreen(false, true),
]

/** Reads the screen's brightness range, color gamut, and the browser's gain map support. */
export function ScreenDemo() {
  const hdr = useMediaQuery('(dynamic-range: high)')
  const gamut = useScreenGamut() ?? 'srgb'
  const firefox = useSyncExternalStore(
    subscribeNever,
    () => isFirefox(navigator.userAgent),
    () => null,
  )
  const pending = hdr === null || firefox === null
  const verdict = pending ? CHECKING : describeScreen(hdr, firefox)
  const rows = pending
    ? PENDING.map((row) => ({ ...row, ok: false }))
    : [
        { label: 'HDR brightness', ok: hdr, value: hdr ? 'Yes' : 'No' },
        { label: 'Wide color', ok: gamut !== 'srgb', value: GAMUT_NAMES[gamut] },
        { label: 'Gain maps', ok: !firefox, value: firefox ? 'Not in Firefox' : 'Yes' },
      ]
  return (
    <>
      <dl aria-busy={pending || undefined} className={styles.checks}>
        {rows.map((row) => (
          <div className={styles.check} key={row.label}>
            <dt className={styles.checkLabel}>{row.label}</dt>
            <dd
              className={styles.checkValue}
              data-ok={row.ok || undefined}
              data-pending={pending || undefined}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.notes}>
        {VERDICTS.map((text) => (
          <div
            aria-hidden={text !== verdict || undefined}
            className={styles.note}
            data-active={text === verdict || undefined}
            key={text}
          >
            <Caption>{text}</Caption>
          </div>
        ))}
      </div>
    </>
  )
}

/** A polygon's points as an SVG `points` list, on the chart's 800 by 900 view box. */
export function toPoints(points: readonly Point[]): string {
  return points
    .map(([x, y]) => `${(x * 1000).toFixed(1)},${((CHART_HEIGHT - y) * 1000).toFixed(1)}`)
    .join(' ')
}

/** A canvas ref that paints the chart once, when the canvas mounts. */
function paintOnMount(canvas: HTMLCanvasElement | null) {
  if (canvas) paintChart(canvas)
}

const SPACE_NOTES: Record<Space, string> = {
  srgb: "It's from 1996, built for CRT monitors, and it's still what most of the web and every plain JPG assume.",
  p3: "Apple has shipped P3 screens since 2015, and most HDR phones and laptops show it. That's where the extra green comes from.",
  rec2020:
    "HDR TV is mastered for it. Hardly any screen can show all of it yet, so for now it's room to grow.",
}

/** What the color space demo says about a space. */
export function describeSpace(space: Space): string {
  return `${SPACES[space].name} covers ${coverage(space)}% of the colors on this chart. ${SPACE_NOTES[space]}`
}

/**
 * The colors people can see, with the sRGB, Display P3, and Rec. 2020 triangles on top. Picking
 * one dims everything outside it. The colors are painted in Display P3 where the browser allows.
 */
export function GamutDemo() {
  const [space, setSpace] = useState<Space>('srgb')
  const yours = useScreenGamut()
  const locus = toPoints(LOCUS)
  function choose(next: Space) {
    playSound('select')
    setSpace(next)
  }
  return (
    <>
      <div className={styles.gamut}>
        <div className={styles.diagram}>
          <canvas
            aria-hidden="true"
            className={styles.layer}
            height={450}
            ref={paintOnMount}
            width={400}
          />
          <svg
            aria-label={`The colors people can see, with the ${SPACES[space].name} triangle marked`}
            className={styles.layer}
            role="img"
            viewBox="0 0 800 900"
          >
            <path className={styles.mask} d={`M${locus}Z M${toPoints(SPACES[space].primaries)}Z`} />
            <polygon className={styles.locus} points={locus} />
            {(Object.keys(SPACES) as Space[]).map((key) => (
              <polygon
                className={styles.triangle}
                data-active={key === space || undefined}
                key={key}
                points={toPoints(SPACES[key].primaries)}
              />
            ))}
          </svg>
        </div>
        {yours ? (
          <span className={styles.tag} data-side="hdr">
            Your screen: {SPACES[yours].name}
          </span>
        ) : null}
      </div>
      <Controls label="Color space">
        {(Object.keys(SPACES) as Space[]).map((key) => (
          <DemoButton
            aria-pressed={key === space}
            key={key}
            onClick={() => choose(key)}
            variant="secondary"
          >
            {SPACES[key].name}
          </DemoButton>
        ))}
      </Controls>
      <div className={styles.notes}>
        {(Object.keys(SPACES) as Space[]).map((key) => (
          <div
            aria-hidden={key !== space || undefined}
            className={styles.note}
            data-active={key === space || undefined}
            key={key}
          >
            <Caption>{describeSpace(key)}</Caption>
          </div>
        ))}
      </div>
    </>
  )
}

interface Pair {
  id: string
  label: string
  alt: string
  file: string
  width: number
  height: number
  note: string
  settings: string
}

export const PAIRS: readonly Pair[] = [
  {
    id: 'hollywood',
    label: 'Hollywood Blvd',
    alt: 'Christmas decorations, neon, and dramatic clouds over Hollywood Boulevard at Hollywood Studios',
    file: 'Hollywood-Blvd-Christmas_{}_20221205.jpg',
    width: 1920,
    height: 1280,
    note: 'Christmas on Hollywood Boulevard. The SDR side loses the energy of the scene: the neon, the decorations, the dramatic clouds. The HDR side is a lot closer to what I saw standing there.',
    settings: 'Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 640',
  },
  {
    id: 'castle',
    label: 'Castle',
    alt: "Cinderella's Castle lit purple for the 50th Anniversary, before the fireworks",
    file: 'Cinderellas-Castle-50th-Anniversary_{}_20221206.jpg',
    width: 1920,
    height: 1280,
    note: 'Cinderella\'s Castle before the fireworks, with the 50th Anniversary projections running. SDR gets the purple and not much else. HDR brings out the street lamps and the back-lit "50" on the castle, with less banding in the purple.',
    settings: 'Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 2500',
  },
  {
    id: 'remy',
    label: "Remy's studio",
    alt: "Remy's studio apartment, from the queue for Remy's Ratatouille Adventure at EPCOT",
    file: 'Art-Studio-in-Remys-Ratatouille-Adventure_{}_20220902.jpg',
    width: 1920,
    height: 1080,
    note: "Remy's studio apartment, from the queue at EPCOT. This one's subtle. The lamps get brighter with no banding, and Remy's chef hat goes from a dull blue-gray to a clean white.",
    settings: 'Sony a7R IVA | Sony 16-35mm PZ | 1/160 sec, f/4, ISO 10000',
  },
]

/** The URL of a pair's SDR or HDR file. */
export function pairSrc(pair: Pair, version: 'SDR' | 'HDR'): string {
  return `${BASE}/${pair.file.replace('{}', version)}`
}

/**
 * The SDR and HDR versions of a photo stacked, with a handle that wipes
 * between them. Both load the original files: the image optimizer would
 * re-encode the HDR one and drop its gain map. Every photo shares one frame
 * and every note one slot, sized for the tallest, so switching doesn't move
 * the page.
 */
export function WipeDemo() {
  const [pair, setPair] = useState(PAIRS[0]!)
  const [split, setSplit] = useState(50)
  const photo = { height: pair.height, width: pair.width }
  function wipe(next: number) {
    if (Math.floor(next / 10) !== Math.floor(split / 10)) blip(440 + next * 8)
    setSplit(next)
  }
  function choose(next: Pair) {
    playSound('select')
    setPair(next)
  }
  return (
    <>
      <div className={styles.wipe}>
        <Image
          alt={`${pair.alt}, SDR`}
          className={styles.photo}
          src={pairSrc(pair, 'SDR')}
          unoptimized
          {...photo}
        />
        <Image
          alt={`${pair.alt}, HDR`}
          className={styles.photo}
          src={pairSrc(pair, 'HDR')}
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
          unoptimized
          {...photo}
        />
        <span aria-hidden="true" className={styles.divider} style={{ left: `${split}%` }} />
        <span aria-hidden="true" className={styles.tag} data-side="sdr">
          SDR
        </span>
        <span aria-hidden="true" className={styles.tag} data-side="hdr">
          HDR
        </span>
        <input
          aria-label="Wipe between SDR and HDR"
          className={styles.handle}
          max={100}
          min={0}
          onChange={(event) => wipe(Number(event.target.value))}
          type="range"
          value={split}
        />
      </div>
      <Controls label="Photo">
        {PAIRS.map((option) => (
          <DemoButton
            aria-pressed={option.id === pair.id}
            key={option.id}
            onClick={() => choose(option)}
            variant="secondary"
          >
            {option.label}
          </DemoButton>
        ))}
      </Controls>
      <div className={styles.notes}>
        {PAIRS.map((option) => (
          <div
            aria-hidden={option.id !== pair.id || undefined}
            className={styles.note}
            data-active={option.id === pair.id || undefined}
            key={option.id}
          >
            <Caption>{option.note}</Caption>
            <Caption>{option.settings}</Caption>
          </div>
        ))}
      </div>
    </>
  )
}

/** How bright SDR white is on an HDR screen, per ITU-R BT.2408. */
export const SDR_WHITE_NITS = 203

const MAX_HEADROOM = 16

/** The chart's range in stops from SDR white: each stop up is twice as bright. */
const TOP = 4.5
const BOTTOM = -5

const TICKS = [
  { stops: 4, label: '16x' },
  { stops: 3, label: '8x' },
  { stops: 2, label: '4x' },
  { stops: 1, label: '2x' },
  { stops: 0, label: 'White' },
]

/** How much of the gain map's boost a display with this headroom gets, from 0 to 1. */
export function gainWeight(headroom: number): number {
  return Math.min(Math.max(Math.log2(headroom) / CAPACITY_MAX, 0), 1)
}

/**
 * The scanline as a display with `headroom` shows it, in stops from SDR
 * white. The gain map's boost is scaled by `gainWeight`, then clipped at the
 * display's limit, the way the gain map spec renders it.
 */
export function shownStops(headroom: number): number[] {
  const weight = gainWeight(headroom)
  return SDR.map((sdr, i) => {
    const gain = Math.log2((HDR[i]! + OFFSET) / (sdr + OFFSET))
    return Math.min(Math.log2((sdr + OFFSET) * 2 ** (gain * weight) - OFFSET), Math.log2(headroom))
  })
}

/** Where a brightness in stops sits on the chart, as a percentage from the top. */
export function toY(stops: number): number {
  return ((TOP - Math.min(Math.max(stops, BOTTOM), TOP)) / (TOP - BOTTOM)) * 100
}

/** An SVG path through the scanline, across a 300 by 100 view box. */
export function buildPath(stops: readonly number[]): string {
  const dx = 300 / (stops.length - 1)
  return stops
    .map((value, i) => `${i === 0 ? 'M' : 'L'}${(i * dx).toFixed(1)} ${toY(value).toFixed(1)}`)
    .join(' ')
}

/** A screen to compare each headroom to, by its peak brightness. */
function compareScreen(headroom: number): string {
  if (headroom === 8) return 'about what a MacBook Pro or iPhone Pro hits for HDR'
  if (headroom === 15) return 'about an iPhone Pro in direct sun'
  if (headroom > 15) return 'brighter than an iPhone Pro in direct sun'
  if (headroom > 8) return 'brighter than a MacBook Pro'
  return 'brighter than an average 250-nit monitor'
}

/** What the headroom demo says about a display with this headroom. */
export function describeHeadroom(headroom: number): string {
  if (headroom === 1)
    return "1x is SDR, like an average monitor at 250 nits. White is as bright as it gets, so every bulb flattens out at the white line. That's the SDR photo."
  const nits = (headroom * SDR_WHITE_NITS).toLocaleString('en-US')
  const share = Math.round(gainWeight(headroom) * 100)
  return `At ${headroom}x, this screen can go up to ${nits} nits, ${compareScreen(headroom)}. The gain map uses ${share}% of the boost it stores, so the bulbs climb past white and the shadows stay put.`
}

/** Every headroom the slider can reach, so the caption slot fits the longest. */
const HEADROOMS = Array.from({ length: MAX_HEADROOM }, (_, i) => i + 1)

/**
 * One row of a real photo, brightened by its gain map as the display's
 * headroom goes up. The part above white glows brighter as it climbs. That
 * glow is drawn: CSS colors can't go brighter than white yet.
 */
export function HeadroomDemo() {
  const [headroom, setHeadroom] = useState(1)
  const clipId = useId()
  const d = buildPath(shownStops(headroom))
  const white = toY(0)
  const limit = toY(Math.log2(headroom))
  function change(next: number) {
    blip(440 * Math.sqrt(next))
    setHeadroom(next)
  }
  return (
    <>
      <div className={styles.chart} style={{ '--glow': gainWeight(headroom) } as CSSProperties}>
        <div className={styles.plotArea}>
          {TICKS.map((tick) => (
            <span
              aria-hidden="true"
              className={styles.tick}
              key={tick.label}
              style={{ top: `${toY(tick.stops)}%` }}
            >
              {tick.label}
            </span>
          ))}
          <span aria-hidden="true" className={styles.tick} style={{ top: '100%' }}>
            Dark
          </span>
          <svg
            aria-label={`Brightness across a row of the Hollywood Blvd photo, through the marquee lights, on a screen with ${headroom}x headroom`}
            className={styles.lines}
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 300 100"
          >
            <defs>
              <clipPath id={clipId}>
                <rect height={white} width="300" x="0" y="0" />
              </clipPath>
            </defs>
            {TICKS.map((tick) => (
              <line
                className={tick.stops === 0 ? styles.white : styles.grid}
                key={tick.label}
                x1="0"
                x2="300"
                y1={toY(tick.stops)}
                y2={toY(tick.stops)}
              />
            ))}
            <path className={styles.trace} d={d} />
            <path className={styles.glow} clipPath={`url(#${clipId})`} d={d} />
            <line className={styles.limit} x1="0" x2="300" y1={limit} y2={limit} />
          </svg>
          <span aria-hidden="true" className={styles.limitLabel} style={{ top: `${limit}%` }}>
            Screen limit
          </span>
        </div>
      </div>
      <Controls>
        <Slider label="Headroom" max={MAX_HEADROOM} min={1} onChange={change} value={headroom} />
      </Controls>
      <div className={styles.notes}>
        {HEADROOMS.map((value) => (
          <div
            aria-hidden={value !== headroom || undefined}
            className={styles.note}
            data-active={value === headroom || undefined}
            key={value}
          >
            <Caption>{describeHeadroom(value)}</Caption>
          </div>
        ))}
      </div>
    </>
  )
}
