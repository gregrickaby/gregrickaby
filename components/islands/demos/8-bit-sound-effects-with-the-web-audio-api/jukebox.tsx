'use client'

import { useEffect, useRef, useState } from 'react'

import { startChiptune, type Channel, type Chiptune } from '@/components/islands/chiptune'
import { Caption, Controls, DemoButton } from '@/components/islands/demo-kit/controls'
import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'

import { BUILD_ORDER, CHANNEL_NAMES, ROLES, SONG } from './chiptune'
import styles from './jukebox.module.css'

/** What each step of the build adds, keyed by how many channels are on. */
const STAGES = [
  'Everything is off. Flip a switch to bring a part back.',
  'Drums only: the noise channel, at a different grit for the kick, snare, and hi-hat.',
  'Plus bass on the triangle channel. The NES gave it no volume control, only on or off.',
  'Plus rhythm: arpeggios on Pulse 2, a thin 12.5% pulse that stays out of the way.',
  "Plus the melody on Pulse 1, a 25% pulse. That's the whole song.",
]

/** Two bars of 16 steps: how long each part plays before the next comes in. */
const BUILD_STEPS = 32

/**
 * Draws what a channel is playing right now, like an oscilloscope, scaled so
 * quiet channels fill the screen too. The line takes the canvas's CSS color.
 */
export function drawScope(
  canvas: HTMLCanvasElement | null | undefined,
  analyser: AnalyserNode,
  samples: Float32Array<ArrayBuffer>,
) {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  analyser.getFloatTimeDomainData(samples)
  const { height, width } = canvas
  const peak = Math.max(0.001, ...samples.map(Math.abs))
  context.clearRect(0, 0, width, height)
  context.strokeStyle = getComputedStyle(canvas).color
  context.lineWidth = 2
  context.beginPath()
  samples.forEach((value, i) => {
    const x = (i / (samples.length - 1)) * width
    const y = height / 2 - (value / peak) * height * 0.4
    if (i === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  })
  context.stroke()
}

/**
 * What the jukebox says: the stage of the build when the channels on are the
 * first few in band order, or a plain list when the reader mixed their own.
 */
export function describeJukebox(on: ReadonlySet<Channel>): string {
  const inOrder = BUILD_ORDER.slice(0, on.size).every((channel) => on.has(channel))
  if (inOrder) return STAGES[on.size] as string
  const playing = BUILD_ORDER.filter((channel) => on.has(channel)).map((c) => ROLES[c])
  return `Your mix: ${playing.join(', ').toLowerCase()}.`
}

/**
 * An original song on four NES-style channels. It starts with the drums and
 * brings in another part every two bars, the way a band builds a song. Each
 * channel has an on/off switch and its own oscilloscope; flipping one hands
 * the mix to the reader.
 */
export function JukeboxDemo() {
  const player = useRef<Chiptune | undefined>(undefined)
  const canvases = useRef(new Map<Channel, HTMLCanvasElement | null>())
  const building = useRef(false)
  const [on, setOn] = useState<ReadonlySet<Channel>>(() => new Set(['noise']))
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const started = player.current
    if (!playing || !started) return
    const song = started
    const samples = new Float32Array(512)
    let frame = requestAnimationFrame(draw)
    function draw() {
      for (const channel of BUILD_ORDER) {
        drawScope(canvases.current.get(channel), song.analysers[channel], samples)
      }
      frame = requestAnimationFrame(draw)
    }
    return () => {
      cancelAnimationFrame(frame)
      song.stop()
      releaseSpeakers(player)
    }
  }, [playing])

  /** Every two bars, the next part in band order comes in, until all four play. */
  function build(step: number) {
    const channel = BUILD_ORDER[step / BUILD_STEPS]
    if (!building.current || step === 0 || !channel) return
    player.current?.setMuted(channel, false)
    setOn((current) => new Set([...current, channel]))
  }

  function start() {
    claimSpeakers(player, () => setPlaying(false))
    building.current = true
    setOn(new Set(['noise']))
    player.current = startChiptune(SONG, () => SONG.bpm, build, new Set(BUILD_ORDER.slice(1)))
    setPlaying(Boolean(player.current))
  }

  function flip(channel: Channel) {
    building.current = false
    const next = new Set(on)
    if (next.has(channel)) next.delete(channel)
    else next.add(channel)
    player.current?.setMuted(channel, !next.has(channel))
    setOn(next)
  }

  return (
    <>
      <ul className={styles.channels}>
        {BUILD_ORDER.map((channel) => (
          <li className={`${styles.channel} ${styles[channel]}`} key={channel}>
            <button
              aria-checked={on.has(channel)}
              className={styles.switch}
              onClick={() => flip(channel)}
              role="switch"
              type="button"
            >
              <span aria-hidden="true" className={styles.track}>
                <span className={styles.knob} />
              </span>
              <span className={styles.role}>{ROLES[channel]}</span>
              <span className={styles.chip}>{CHANNEL_NAMES[channel]}</span>
            </button>
            <canvas
              aria-hidden="true"
              className={styles.scope}
              height={48}
              ref={(canvas) => {
                canvases.current.set(channel, canvas)
              }}
              width={240}
            />
          </li>
        ))}
      </ul>
      <Controls>
        <DemoButton onClick={playing ? () => setPlaying(false) : start} playing={playing} />
      </Controls>
      <Caption>{describeJukebox(on)}</Caption>
    </>
  )
}
