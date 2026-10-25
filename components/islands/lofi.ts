import { noteAt, noteFrequency, parseLane, toneAt } from '@/components/islands/sequencer'
import { noiseBuffer } from '@/components/islands/sounds'
import { playTape, type StartTape, type TapeTrack } from '@/components/islands/tape'

/** A keyboard sound, built from sine or sawtooth partials. */
export type Voice = 'rhodes' | 'pad' | 'vibes'

/**
 * A lo-fi track. Chords change once a bar; the other lanes are 16-step bars
 * that loop on their own, so a one-bar drum beat runs under an eight-bar
 * lead.
 */
export interface Track extends TapeTrack {
  chords: readonly string[]
  /** Hold each chord for the bar, or break it into eighth notes. */
  comp: 'hold' | 'arpeggio'
  chordVoice: Voice
  leadVoice: Voice
  bass: readonly string[]
  lead: readonly string[]
  kick: string
  snare: string
  hat: string
  /** The snare's filter center in hertz and its length: a fat snare, a clap, or a rim click. */
  snareTone: readonly [hz: number, seconds: number]
}

const REST = '. . . . . . . . . . . . . . . .'

/** Root on the downbeat, again just before beat three, then the fifth. */
function bassBar(root: string, fifth: string): string {
  return `${root} - - - - - . ${root} . . ${fifth} - - - . .`
}

/** One long note for the whole bar. */
function held(root: string): string {
  return `${root} - - - - - - - - - - - - - - .`
}

/** A pushy line that jumps between the root and its octave. */
function octaves(root: string, up: string): string {
  return `${root} - . ${root} . . ${up} - . . ${root} . . ${root} ${up} .`
}

/** An eighth-note boogie up the chord and back: root, third, fifth, sixth, flat seventh. */
function boogie(
  root: string,
  third: string,
  fifth: string,
  sixth: string,
  seventh: string,
): string {
  return `${root} - ${third} - ${fifth} - ${sixth} - ${seventh} - ${sixth} - ${fifth} - ${third} -`
}

const BOOGIE_A = boogie('A2', 'C#3', 'E3', 'F#3', 'G3')
const BOOGIE_D = boogie('D2', 'F#2', 'A2', 'B2', 'C3')
const BOOGIE_E = boogie('E2', 'G#2', 'B2', 'C#3', 'D3')

export const TRACKS: readonly Track[] = [
  {
    title: '404 blues',
    bpm: 76,
    swing: 0.2,
    bars: 24,
    // Twelve-bar blues in A, with ninths: four bars of A, two of D, two of A,
    // then E, D, A, and E to turn it around.
    chords: [
      'A2 G3 B3 C#4 E4',
      'A2 G3 B3 C#4 E4',
      'A2 G3 B3 C#4 E4',
      'A2 G3 B3 C#4 E4',
      'D3 F#3 C4 E4',
      'D3 F#3 C4 E4',
      'A2 G3 B3 C#4 E4',
      'A2 G3 B3 C#4 E4',
      'E2 D3 F#3 G#3 B3',
      'D3 F#3 C4 E4',
      'A2 G3 B3 C#4 E4',
      'E2 D3 F#3 G#3 B3',
    ],
    comp: 'hold',
    chordVoice: 'rhodes',
    leadVoice: 'vibes',
    bass: [
      BOOGIE_A,
      BOOGIE_A,
      BOOGIE_A,
      BOOGIE_A,
      BOOGIE_D,
      BOOGIE_D,
      BOOGIE_A,
      BOOGIE_A,
      BOOGIE_E,
      BOOGIE_D,
      BOOGIE_A,
      BOOGIE_E,
    ],
    lead: [
      '. . A4 - C5 - D5 - Eb5 - E5 - - - . .',
      'G5 - E5 - - - . . . . . . . . . .',
      '. . A4 - C5 - D5 - Eb5 - E5 - G5 - A5 -',
      'E5 - - - - - . . . . . . . . . .',
      '. . D5 - F5 - F#5 - A5 - - - C6 - A5 -',
      'F#5 - - - - - . . . . . . . . . .',
      '. . E5 - G5 - A5 - C6 - A5 - G5 - E5 -',
      'A4 - - - - - . . . . . . . . . .',
      'G#5 - - - B5 - - - D6 - - - B5 - . .',
      'A5 - - - F#5 - - - D5 - - - C5 - . .',
      '. . A4 - C5 - C#5 - E5 - - - . . . .',
      'E5 - D5 - B4 - G#4 - - - - - . . . .',
    ],
    kick: 'x . . . . . . . x . x . . . . .',
    snare: '. . . . x . . . . . . . x . . .',
    hat: 'x . x . x . x . x . x . x . x .',
    snareTone: [1600, 0.14],
    texture: 'vinyl',
  },
  {
    title: 'Coffee before the kids wake up',
    bpm: 78,
    swing: 0.12,
    bars: 16,
    chords: ['D3 F3 A3 C4 E4', 'G2 F3 B3 E4', 'C3 E3 G3 B3 D4', 'A2 G3 Bb3 C#4'],
    comp: 'hold',
    chordVoice: 'rhodes',
    leadVoice: 'rhodes',
    bass: [bassBar('D2', 'A2'), bassBar('G2', 'D2'), bassBar('C2', 'G2'), bassBar('A2', 'E2')],
    lead: [
      REST,
      REST,
      REST,
      REST,
      '. . A4 - C5 - . E5 - - - . D5 - C5 .',
      'B4 - - - . . . . . . A4 - B4 - D5 -',
      'E5 - - - - - . D5 - - B4 - - - . .',
      '. . C#5 - E5 - G5 - Bb4 - - - A4 - - -',
    ],
    kick: 'x . . . . . . x . . x . . . . .',
    snare: '. . . . x . . . . . . . x . . .',
    hat: 'x . x . x . x . x . x . x . x x',
    snareTone: [1800, 0.16],
    texture: 'vinyl',
  },
  {
    title: 'Rain on a tin roof',
    bpm: 62,
    swing: 0.04,
    bars: 16,
    chords: ['A2 E3 G3 B3 C4', 'F2 C3 E3 A3', 'C3 G3 B3 E4', 'E2 B2 D3 G3'],
    comp: 'hold',
    chordVoice: 'pad',
    leadVoice: 'vibes',
    bass: [held('A2'), held('F2'), held('C3'), held('E2')],
    lead: [
      REST,
      REST,
      'E5 - - - - - - - D5 - - - C5 - - -',
      'A4 - - - - - - - - - - - . . . .',
      '. . . . E5 - - - G5 - - - A5 - - -',
      'G5 - - - - - - - E5 - - - - - . .',
      'D5 - - - - - - - C5 - - - B4 - - -',
      'B4 - - - - - - - - - - - . . . .',
    ],
    kick: REST,
    snare: '. . . . . . . . x . . . . . . .',
    hat: 'x x x x x x x x x x x x x x x x',
    snareTone: [3200, 0.05],
    texture: 'rain',
  },
  {
    title: 'Last light at f/8',
    bpm: 92,
    swing: 0.18,
    bars: 16,
    chords: ['Eb3 G3 Bb3 D4', 'F3 Ab3 C4 Eb4', 'G3 Bb3 D4 F4', 'Ab3 C4 Eb4 G4'],
    comp: 'arpeggio',
    chordVoice: 'vibes',
    leadVoice: 'rhodes',
    bass: [octaves('Eb2', 'Eb3'), octaves('F2', 'F3'), octaves('G2', 'G3'), octaves('Ab2', 'Ab3')],
    lead: [
      REST,
      REST,
      REST,
      REST,
      'G5 - - - Bb5 - - - D6 - - - C6 - Bb5 -',
      'Ab5 - - - - - - - . . F5 - G5 - Ab5 -',
      'Bb5 - - - - - D5 - F5 - - - G5 - - -',
      'Eb5 - - - - - - - - - - - . . . .',
    ],
    kick: 'x . . . . . x . . . x . . . . .',
    snare: '. . . . x . . . . . . . x . . .',
    hat: 'x . x x x . x . x . x x x . x .',
    snareTone: [1200, 0.12],
    texture: 'vinyl',
  },
  {
    title: 'Laundry on the line',
    bpm: 84,
    swing: 0.15,
    bars: 16,
    chords: ['G2 F3 Bb3 D4', 'C3 E3 Bb3 D4', 'F2 E3 A3 C4', 'D3 F3 A3 C4'],
    comp: 'arpeggio',
    chordVoice: 'rhodes',
    leadVoice: 'vibes',
    bass: [bassBar('G2', 'D3'), bassBar('C2', 'G2'), bassBar('F2', 'C3'), bassBar('D2', 'A2')],
    lead: [
      REST,
      REST,
      REST,
      REST,
      '. . D5 - F5 - A5 - G5 - - - F5 - D5 -',
      'E5 - - - - - . . C5 - D5 - E5 - G5 -',
      'A5 - - - - - G5 - F5 - - - E5 - - -',
      'D5 - - - - - - - - - - - . . . .',
    ],
    kick: 'x . . . . . . . x . x . . . . .',
    snare: '. . . . x . . . . . . . x . . x',
    hat: 'x . x . x . x . x . x . x . x .',
    snareTone: [2400, 0.08],
    texture: 'vinyl',
  },
  {
    title: 'Night bus home',
    bpm: 70,
    swing: 0.08,
    bars: 16,
    chords: ['C3 G3 Bb3 Eb4', 'Ab2 G3 C4 Eb4', 'F2 Ab3 C4 Eb4', 'G2 F3 B3 D4'],
    comp: 'hold',
    chordVoice: 'pad',
    leadVoice: 'rhodes',
    bass: [held('C2'), held('Ab2'), held('F2'), held('G2')],
    lead: [
      REST,
      REST,
      'G4 - - - Bb4 - - - C5 - - - Eb5 - - -',
      'D5 - - - - - - - C5 - - - . . . .',
      '. . . . Eb5 - - - G5 - - - F5 - Eb5 -',
      'C5 - - - - - - - . . . . . . . .',
      'G4 - - - - - Ab4 - Bb4 - - - C5 - - -',
      'B4 - - - - - - - - - - - . . . .',
    ],
    kick: 'x . . . . . . . . . x . . . . .',
    snare: '. . . . . . . . x . . . . . . .',
    hat: 'x . x . x . x . x . x . x . x .',
    snareTone: [3200, 0.05],
    texture: 'rain',
  },
]

/**
 * Each voice's partials: wave shape, pitch ratio, share of the level, detune
 * in cents, attack in seconds, and decay as a fraction of the note's length.
 * The Rhodes is a sine with a soft octave, the pad two detuned sawtooths that
 * swell in, and the vibes a sine with a quick metallic ping two octaves up.
 */
const VOICES: Record<
  Voice,
  readonly (readonly [OscillatorType, number, number, number, number, number])[]
> = {
  rhodes: [
    ['sine', 1, 1, 0, 0.02, 0.5],
    ['sine', 2, 0.25, 0, 0.02, 0.25],
  ],
  pad: [
    ['sawtooth', 1, 0.3, -8, 0.6, 2],
    ['sawtooth', 1, 0.3, 8, 0.6, 2],
  ],
  vibes: [
    ['sine', 1, 1, 0, 0.005, 0.6],
    ['sine', 4, 0.15, 0, 0.005, 0.05],
  ],
}

/**
 * Plays a lo-fi track through the tape's chain until stopped. Returns
 * undefined where Web Audio is missing.
 */
export const startTape: StartTape<Track> = (track, lofi, onStep, onEnd) =>
  playTape(track, lofi, onStep, onEnd, ({ audio, bend, filter }) => {
    const lanes = {
      bass: parseLane(track.bass),
      lead: parseLane(track.lead),
      kick: parseLane([track.kick]),
      snare: parseLane([track.snare]),
      hat: parseLane([track.hat]),
    }
    const chords = track.chords.map((chord) =>
      chord.split(' ').flatMap((name) => noteFrequency(name) ?? []),
    )
    const barSeconds = 16 * (60 / track.bpm / 4)

    /** One note on a keyboard voice, bent by the tape wobble, with a short release. */
    function playVoice(voice: Voice, hz: number, time: number, seconds: number, level: number) {
      for (const [type, ratio, share, detune, attack, decay] of VOICES[voice]) {
        const oscillator = audio.createOscillator()
        oscillator.type = type
        oscillator.frequency.value = hz * ratio
        oscillator.detune.value = detune
        bend(oscillator)
        const gain = audio.createGain()
        gain.gain.setValueAtTime(0, time)
        gain.gain.linearRampToValueAtTime(level * share, time + attack)
        gain.gain.setTargetAtTime(0, time + attack, seconds * decay)
        gain.gain.setTargetAtTime(0, time + seconds, 0.12)
        oscillator.connect(gain).connect(filter)
        oscillator.start(time)
        oscillator.stop(time + seconds + 0.8)
      }
    }

    function playBass(hz: number, time: number, seconds: number) {
      const oscillator = audio.createOscillator()
      oscillator.frequency.value = hz
      const gain = audio.createGain()
      gain.gain.setValueAtTime(0.16, time)
      gain.gain.setTargetAtTime(0, time + seconds - 0.05, 0.03)
      oscillator.connect(gain).connect(filter)
      oscillator.start(time)
      oscillator.stop(time + seconds + 0.2)
    }

    function playKick(time: number) {
      const oscillator = audio.createOscillator()
      oscillator.frequency.setValueAtTime(120, time)
      oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.12)
      const gain = audio.createGain()
      gain.gain.setValueAtTime(0.35, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)
      oscillator.connect(gain).connect(filter)
      oscillator.start(time)
      oscillator.stop(time + 0.3)
    }

    function playNoise(
      time: number,
      type: BiquadFilterType,
      hz: number,
      seconds: number,
      level: number,
    ) {
      const source = audio.createBufferSource()
      source.buffer = noiseBuffer(audio, 1)
      const shape = audio.createBiquadFilter()
      shape.type = type
      shape.frequency.value = hz
      const gain = audio.createGain()
      gain.gain.setValueAtTime(level, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + seconds)
      source.connect(shape).connect(gain).connect(filter)
      source.start(time)
      source.stop(time + seconds)
    }

    return (step, time) => {
      // The modulo always lands on a chord; the array type allows undefined.
      /* v8 ignore next */
      const chord = chords[Math.floor(step / 16) % chords.length] ?? []
      if (track.comp === 'hold' && step % 16 === 0) {
        for (const hz of chord) playVoice(track.chordVoice, hz, time, barSeconds, 0.035)
      }
      const broken = chord[((step % 16) / 2) % chord.length]
      if (track.comp === 'arpeggio' && broken) {
        playVoice(track.chordVoice, broken, time, (3 * barSeconds) / 16, 0.05)
      }
      const bass = toneAt(lanes.bass, step)
      if (bass) playBass(bass.hz, time, (bass.steps * barSeconds) / 16)
      const lead = toneAt(lanes.lead, step)
      if (lead) playVoice(track.leadVoice, lead.hz, time, (lead.steps * barSeconds) / 16, 0.06)
      if (noteAt(lanes.kick, step)) playKick(time)
      if (noteAt(lanes.snare, step)) playNoise(time, 'bandpass', ...track.snareTone, 0.12)
      if (noteAt(lanes.hat, step)) playNoise(time, 'highpass', 7000, 0.04, 0.04)
    }
  })
