import { useEffect, useRef, useState, type RefObject } from 'react'

import { startChiptune, type Channel, type Chiptune } from '@/components/islands/chiptune'
import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'
import { SONG } from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/chiptune'
import { getContext } from '@/components/islands/sounds'

import { bandLevels, binRanges, dbToGain, type FilterSpec } from './equalizer'

/** The nodes between the song and the speakers. */
export interface Chain {
  audio: BaseAudioContext
  input: GainNode
  filters: BiquadFilterNode[]
  analyser: AnalyserNode
  disconnect: () => void
}

/**
 * Builds the chain: a preamp, the filters in a row, then an analyser to look
 * at what comes out, then the speakers.
 */
export function buildChain(
  audio: BaseAudioContext,
  specs: readonly FilterSpec[],
  preamp: number,
  smoothing: number,
): Chain {
  const input = audio.createGain()
  input.gain.value = dbToGain(preamp)
  const filters = specs.map((spec) => {
    const filter = audio.createBiquadFilter()
    filter.type = spec.type
    filter.frequency.value = spec.frequency
    filter.gain.value = spec.gain
    filter.Q.value = spec.q
    return filter
  })
  const analyser = audio.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = smoothing
  let node: AudioNode = input
  for (const filter of filters) node = node.connect(filter)
  node.connect(analyser).connect(audio.destination)
  return {
    audio,
    input,
    filters,
    analyser,
    disconnect() {
      analyser.disconnect()
    },
  }
}

/** Draws one bar per level, from 0 to 1, in the canvas's CSS color. */
export function drawBars(canvas: HTMLCanvasElement | null, levels: readonly number[]) {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  const { height, width } = canvas
  const slot = width / levels.length
  context.clearRect(0, 0, width, height)
  context.fillStyle = getComputedStyle(canvas).color
  levels.forEach((level, i) => {
    const bar = Math.round(level * height)
    context.fillRect(Math.round(i * slot + 2), height - bar, Math.round(slot - 4), bar)
  })
}

/**
 * Plays the chiptune from the 8-bit post through an equalizer and draws its
 * spectrum as bars on `canvas`. Filter, preamp, and smoothing changes glide
 * in while the song plays. `clipping` turns true while the wave goes past
 * what the speakers can play.
 *
 * With `media`, the equalizer plays that `<audio>` element instead. Call
 * `start` when it plays and `stop` when it pauses; stopping pauses it too.
 */
export function useEqualizer({
  filters,
  muted = new Set(),
  preamp = 0,
  smoothing = 0.8,
  spacing = 'octaves',
  media,
}: {
  filters: readonly FilterSpec[]
  media?: RefObject<HTMLAudioElement | null>
  muted?: ReadonlySet<Channel>
  preamp?: number
  smoothing?: number
  spacing?: 'even' | 'octaves'
}) {
  const player = useRef<Chiptune | undefined>(undefined)
  const chain = useRef<Chain | undefined>(undefined)
  const source = useRef<MediaElementAudioSourceNode | undefined>(undefined)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const settings = useRef({ filters, muted, preamp, smoothing, spacing })
  const [playing, setPlaying] = useState(false)
  const [clipping, setClipping] = useState(false)

  useEffect(() => {
    settings.current = { filters, muted, preamp, smoothing, spacing }
    const nodes = chain.current
    if (!nodes) return
    const now = nodes.audio.currentTime
    nodes.input.gain.setTargetAtTime(dbToGain(preamp), now, 0.02)
    nodes.analyser.smoothingTimeConstant = smoothing
    filters.forEach((spec, i) => {
      nodes.filters[i]?.frequency.setTargetAtTime(spec.frequency, now, 0.02)
      nodes.filters[i]?.gain.setTargetAtTime(spec.gain, now, 0.02)
    })
  }, [filters, muted, preamp, smoothing, spacing])

  useEffect(() => {
    const song = player.current
    const nodes = chain.current
    const element = media?.current
    if (!playing || !nodes) return
    const { analyser, audio } = nodes
    const data = new Uint8Array(analyser.frequencyBinCount)
    const samples = new Float32Array(analyser.fftSize)
    let frame = requestAnimationFrame(draw)
    function draw() {
      analyser.getByteFrequencyData(data)
      analyser.getFloatTimeDomainData(samples)
      const ranges = binRanges(audio.sampleRate, data.length, settings.current.spacing)
      drawBars(canvas.current, bandLevels(data, ranges))
      setClipping(samples.some((sample) => Math.abs(sample) > 1))
      frame = requestAnimationFrame(draw)
    }
    return () => {
      cancelAnimationFrame(frame)
      song?.stop()
      element?.pause()
      source.current?.disconnect()
      setTimeout(() => nodes.disconnect(), 250)
      chain.current = undefined
      setClipping(false)
      releaseSpeakers(player)
    }
  }, [media, playing])

  function start() {
    const audio = getContext()
    if (!audio) return
    claimSpeakers(player, () => setPlaying(false))
    const { filters, muted, preamp, smoothing } = settings.current
    chain.current = buildChain(audio, filters, preamp, smoothing)
    const element = media?.current
    if (element) {
      // An element gets one source for life, and plays only through it after.
      source.current ??= audio.createMediaElementSource(element)
      source.current.connect(chain.current.input)
    } else {
      player.current = startChiptune(
        SONG,
        () => SONG.bpm,
        () => undefined,
        muted,
        chain.current.input,
      )
    }
    setPlaying(true)
  }

  function setMuted(channel: Channel, silent: boolean) {
    player.current?.setMuted(channel, silent)
  }

  return {
    canvas,
    clipping,
    playing,
    setMuted,
    start: () => {
      if (!playing) start()
    },
    stop: () => setPlaying(false),
    toggle: playing ? () => setPlaying(false) : start,
  }
}
