'use client'

import { useRef, useState, type RefObject } from 'react'

import type { Channel } from '@/components/islands/audio/chiptune'
import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { Plot } from '@/components/islands/demo-kit/plot'
import {
  BUILD_ORDER,
  ROLES,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/chiptune'

import styles from './demos.module.css'
import {
  BAND_Q,
  BANDS,
  bandFilters,
  CURVE_RATE,
  formatBand,
  formatDb,
  formatHz,
  GHOST_CUT,
  positionToHz,
  PRESETS,
  responseCurve,
  type FilterSpec,
} from './equalizer'
import { useEqualizer } from './player'

const FLAT = PRESETS.Flat as readonly number[]

/** Everything but the melody, for hearing the melody alone. */
const ALL_BUT_MELODY: ReadonlySet<Channel> = new Set(['noise', 'triangle', 'pulse2'])

/** A bar's label: its octave band, or where its slice of bins starts. */
export function barLabels(spacing: 'even' | 'octaves'): string[] {
  return BANDS.map((band, i) =>
    spacing === 'octaves' ? formatBand(band) : formatBand(((CURVE_RATE / 2) * i) / BANDS.length),
  )
}

/** The spectrum, one bar per label, with the labels underneath. */
function Spectrum({
  canvas,
  labels,
}: {
  canvas: RefObject<HTMLCanvasElement | null>
  labels: readonly string[]
}) {
  return (
    <div className={styles.spectrum}>
      <canvas aria-hidden="true" className={styles.bars} height={160} ref={canvas} width={600} />
      <ol aria-hidden="true" className={styles.labels}>
        {labels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
    </div>
  )
}

/**
 * The song's spectrum as ten bars, with a switch per part and a choice of
 * spacing. Even spacing is the trap: almost the whole song lands in the
 * first bar.
 */
export function BarsDemo() {
  const [spacing, setSpacing] = useState<'even' | 'octaves'>('even')
  const [muted, setMuted] = useState<ReadonlySet<Channel>>(() => new Set())
  const eq = useEqualizer({ filters: [], muted, spacing })

  function flip(channel: Channel) {
    const next = new Set(muted)
    if (next.has(channel)) next.delete(channel)
    else next.add(channel)
    eq.setMuted(channel, next.has(channel))
    setMuted(next)
  }

  return (
    <>
      <Spectrum canvas={eq.canvas} labels={barLabels(spacing)} />
      <Controls label="Parts">
        {BUILD_ORDER.map((channel) => (
          <DemoButton
            aria-pressed={!muted.has(channel)}
            key={channel}
            onClick={() => flip(channel)}
            variant="secondary"
          >
            {ROLES[channel]}
          </DemoButton>
        ))}
      </Controls>
      <Controls label="Spacing">
        <DemoButton
          aria-pressed={spacing === 'even'}
          onClick={() => setSpacing('even')}
          variant="secondary"
        >
          Even
        </DemoButton>
        <DemoButton
          aria-pressed={spacing === 'octaves'}
          onClick={() => setSpacing('octaves')}
          variant="secondary"
        >
          Octaves
        </DemoButton>
      </Controls>
      <Controls>
        <DemoButton onClick={eq.toggle} playing={eq.playing} />
      </Controls>
      <Caption>
        {spacing === 'even'
          ? 'Even: every bar covers 2.4 kHz. The bass, rhythm, and melody all pile into the first one.'
          : 'Octaves: every bar covers twice as much as the one before it. Now each part gets its own bars.'}
      </Caption>
    </>
  )
}

/** Describes how the bars move at a smoothing setting from 0 to 95. */
export function describeSmoothing(percent: number): string {
  if (percent < 30) return 'Barely smoothed. The bars twitch on every frame.'
  if (percent < 70) return 'Some smoothing. You can follow the beat.'
  if (percent <= 85) return 'Around the default of 0.8. Smooth, but still on the beat.'
  return 'Syrup. The bars lag so far behind that the drums blur together.'
}

/** The bars again, with the analyser's smoothing on a slider. */
export function SmoothingDemo() {
  const [percent, setPercent] = useState(80)
  const eq = useEqualizer({ filters: [], smoothing: percent / 100 })
  return (
    <>
      <Spectrum canvas={eq.canvas} labels={barLabels('octaves')} />
      <Controls>
        <DemoButton onClick={eq.toggle} playing={eq.playing} />
        <Slider
          format={(value) => (value / 100).toFixed(2)}
          label="Smoothing"
          max={95}
          min={0}
          onChange={setPercent}
          value={percent}
        />
      </Controls>
      <Caption>{describeSmoothing(percent)}</Caption>
    </>
  )
}

/** One peaking filter: a frequency, a boost or cut, and the curve it makes. */
export function KnobDemo() {
  const [position, setPosition] = useState(50)
  const [gain, setGain] = useState(12)
  const hz = positionToHz(position)
  const filters: FilterSpec[] = [{ type: 'peaking', frequency: hz, gain, q: BAND_Q }]
  const eq = useEqualizer({ filters })
  return (
    <>
      <Plot label="The filter's response curve" values={responseCurve(filters)} />
      <Spectrum canvas={eq.canvas} labels={barLabels('octaves')} />
      <Controls>
        <DemoButton onClick={eq.toggle} playing={eq.playing} />
        <Slider
          format={(value) => formatHz(positionToHz(value))}
          label="Frequency"
          max={100}
          min={0}
          onChange={setPosition}
          value={position}
        />
        <Slider format={formatDb} label="Gain" max={24} min={-24} onChange={setGain} value={gain} />
      </Controls>
      <Caption>
        {gain === 0
          ? 'At 0 dB the filter does nothing. Drag the gain up or down.'
          : `${gain > 0 ? 'Boosting' : 'Cutting'} ${Math.abs(gain)} dB around ${formatHz(hz)}.`}
      </Caption>
    </>
  )
}

/** The preset whose sliders match, if any. */
export function matchPreset(gains: readonly number[]): string | undefined {
  return Object.keys(PRESETS).find((name) => PRESETS[name]?.every((value, i) => value === gains[i]))
}

/** Ten upright band sliders, then a button per preset. */
function Bands({
  gains,
  onChange,
}: {
  gains: readonly number[]
  onChange: (gains: readonly number[]) => void
}) {
  const preset = matchPreset(gains)
  return (
    <>
      <div className={styles.sliders}>
        {BANDS.map((band, i) => (
          <label className={styles.band} key={band}>
            <input
              aria-label={`${formatHz(band)} band`}
              max={12}
              min={-24}
              name={`${formatBand(band)} band`}
              onChange={(event) =>
                onChange(gains.map((gain, j) => (j === i ? Number(event.target.value) : gain)))
              }
              type="range"
              value={gains[i]}
            />
            <span aria-hidden="true" className={styles.bandLabel}>
              {formatBand(band)}
            </span>
          </label>
        ))}
      </div>
      <Controls label="Presets">
        {Object.keys(PRESETS).map((name) => (
          <DemoButton
            aria-pressed={preset === name}
            key={name}
            onClick={() => onChange(PRESETS[name] as readonly number[])}
            variant="secondary"
          >
            {name}
          </DemoButton>
        ))}
      </Controls>
    </>
  )
}

/** A ten-band graphic equalizer with presets and a preamp. */
export function EqDemo() {
  const [gains, setGains] = useState<readonly number[]>(FLAT)
  const [preamp, setPreamp] = useState(0)
  const filters = bandFilters(gains)
  const eq = useEqualizer({ filters, preamp })
  const preset = matchPreset(gains)

  return (
    <>
      <Plot label="The equalizer's response curve" values={responseCurve(filters)} />
      <Spectrum canvas={eq.canvas} labels={barLabels('octaves')} />
      <Bands gains={gains} onChange={setGains} />
      <Controls>
        <DemoButton onClick={eq.toggle} playing={eq.playing} />
        <Slider
          format={formatDb}
          label="Preamp"
          max={0}
          min={-24}
          onChange={setPreamp}
          value={preamp}
        />
      </Controls>
      <Caption>
        {eq.clipping
          ? 'Clipping! The wave is louder than your speakers can play. Pull the preamp down.'
          : preset
            ? `Preset: ${preset}.`
            : 'Your own curve.'}
      </Caption>
    </>
  )
}

/** Where the lo-fi track lives, beside the post. */
export const SONG_URL = '/content/posts/web-audio-api-equalizer/lofi-relaxing.mp3'

/**
 * The same equalizer on a real recording, played by an `<audio>` element.
 * Without Web Audio, the player still plays the song, just without the EQ.
 */
export function SongDemo() {
  const [gains, setGains] = useState<readonly number[]>(FLAT)
  const [preamp, setPreamp] = useState(0)
  const media = useRef<HTMLAudioElement | null>(null)
  const filters = bandFilters(gains)
  const eq = useEqualizer({ filters, media, preamp })
  const preset = matchPreset(gains)

  return (
    <>
      <Plot label="The equalizer's response curve" values={responseCurve(filters)} />
      <Spectrum canvas={eq.canvas} labels={barLabels('octaves')} />
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- An instrumental has no words to caption. */}
      <audio
        className={styles.player}
        controls
        onPause={eq.stop}
        onPlay={eq.start}
        preload="none"
        ref={media}
        src={SONG_URL}
      />
      <Bands gains={gains} onChange={setGains} />
      <Controls>
        <Slider
          format={formatDb}
          label="Preamp"
          max={0}
          min={-24}
          onChange={setPreamp}
          value={preamp}
        />
      </Controls>
      <Caption>
        {eq.clipping
          ? 'Clipping! A finished song is already about as loud as it can go. Pull the preamp down.'
          : preset
            ? `Preset: ${preset}.`
            : 'Your own curve.'}
      </Caption>
    </>
  )
}

/**
 * Cuts the bands where the melody's notes sit. Its harmonics, up past
 * 4 kHz, still get through.
 */
export function GhostDemo() {
  const [cut, setCut] = useState(false)
  const [alone, setAlone] = useState(true)
  const filters = bandFilters(cut ? GHOST_CUT : FLAT)
  const eq = useEqualizer({ filters, muted: alone ? ALL_BUT_MELODY : new Set() })

  function listen(melodyOnly: boolean) {
    for (const channel of ALL_BUT_MELODY) eq.setMuted(channel, melodyOnly)
    setAlone(melodyOnly)
  }

  return (
    <>
      <Plot label="The cut's response curve" values={responseCurve(filters)} />
      <Spectrum canvas={eq.canvas} labels={barLabels('octaves')} />
      <Controls>
        <DemoButton onClick={eq.toggle} playing={eq.playing} />
        <DemoButton aria-pressed={cut} onClick={() => setCut(!cut)} variant="secondary">
          Cut 500 Hz to 2 kHz
        </DemoButton>
        <DemoButton aria-pressed={alone} onClick={() => listen(!alone)} variant="secondary">
          Melody alone
        </DemoButton>
      </Controls>
      <Caption>
        {cut
          ? "Every note in the melody is between 500 Hz and 2 kHz, and they're cut by 24 dB. Hear that thin buzz? That's the ghost."
          : 'The melody, uncut. Every note in it falls between 500 Hz and 2 kHz.'}
      </Caption>
    </>
  )
}
