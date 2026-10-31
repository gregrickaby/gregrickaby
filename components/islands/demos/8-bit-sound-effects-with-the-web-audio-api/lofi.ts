import { pulseTerms } from '@/components/islands/chiptune'
import { noteAt, noteFrequency, parseLane, toneAt } from '@/components/islands/sequencer'
import { noiseBuffer } from '@/components/islands/sounds'
import { playTape, type StartTape, type TapeTrack } from '@/components/islands/tape'

/** How much of each cycle a pulse channel stays high: thin, nasal, or square. */
export type Duty = 0.125 | 0.25 | 0.5

/**
 * A chiptune track for the NES's four channels, played through a worn-out
 * tape. Pulse 1 plays the lead, pulse 2 breaks each bar's chord into an
 * arpeggio, the triangle plays bass, and the noise channel plays the drums.
 * The lanes are 16-step bars that loop on their own, so a one-bar drum beat
 * runs under an eight-bar lead.
 */
export interface Track extends TapeTrack {
  chords: readonly string[]
  /** Break each chord into eighth notes, or roll through it every sixteenth. */
  comp: 'eighths' | 'sixteenths'
  leadDuty: Duty
  chordDuty: Duty
  bass: readonly string[]
  lead: readonly string[]
  kick: string
  snare: string
  hat: string
  /** The snare's grit and length: a fat snare or a rim click. */
  snareTone: readonly [grit: number, seconds: number]
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

export const TRACKS: readonly Track[] = [
  {
    title: 'Slow morning in World 1-1',
    bpm: 84,
    swing: 0.12,
    bars: 16,
    chords: ['F3 A3 C4 E4', 'E3 G3 B3 D4', 'D3 F3 A3 C4', 'C3 E3 G3 B3'],
    comp: 'eighths',
    leadDuty: 0.25,
    chordDuty: 0.125,
    bass: [bassBar('F2', 'C3'), bassBar('E2', 'B2'), bassBar('D2', 'A2'), bassBar('C2', 'G2')],
    lead: [
      REST,
      REST,
      REST,
      REST,
      '. . C5 - E5 - . A5 - - - . G5 - E5 .',
      'D5 - - - . . . . . . B4 - D5 - E5 -',
      'F5 - - - - - . E5 - - D5 - - - . .',
      '. . E5 - G5 - B5 - - - A5 - G5 - - -',
    ],
    kick: 'x . . . . . . x . . x . . . . .',
    snare: '. . . . x . . . . . . . x . . .',
    hat: 'x . x . x . x . x . x . x . x x',
    snareTone: [3, 0.12],
    texture: 'vinyl',
  },
  {
    title: 'Rain on the warp pipes',
    bpm: 66,
    swing: 0.04,
    bars: 16,
    chords: ['A3 C4 E4 G4', 'F3 A3 C4 E4', 'C4 E4 G4 B4', 'E3 G3 B3 D4'],
    comp: 'sixteenths',
    leadDuty: 0.5,
    chordDuty: 0.125,
    bass: [held('A2'), held('F2'), held('C3'), held('E2')],
    lead: [
      REST,
      REST,
      'G5 - - - - - E5 - - - D5 - C5 - - -',
      'B4 - - - - - - - - - - - . . . .',
      '. . . . C5 - - - E5 - - - A5 - - -',
      'G5 - - - - - - - F5 - E5 - - - . .',
      'E5 - - - - - - - D5 - - - C5 - - -',
      'B4 - - - - - - - - - - - . . . .',
    ],
    kick: REST,
    snare: '. . . . . . . . x . . . . . . .',
    hat: 'x . x . x . x . x . x . x . x .',
    snareTone: [1, 0.04],
    texture: 'rain',
  },
  {
    title: 'Sunset after World 8-4',
    bpm: 96,
    swing: 0.18,
    bars: 16,
    chords: ['Eb3 G3 Bb3 D4', 'F3 Ab3 C4 Eb4', 'G3 Bb3 D4 F4', 'Ab3 C4 Eb4 G4'],
    comp: 'eighths',
    leadDuty: 0.25,
    chordDuty: 0.5,
    bass: [octaves('Eb2', 'Eb3'), octaves('F2', 'F3'), octaves('G2', 'G3'), octaves('Ab2', 'Ab3')],
    lead: [
      REST,
      REST,
      REST,
      REST,
      'Bb5 - - - G5 - - - Eb5 - F5 - G5 - Bb5 -',
      'C6 - - - - - Ab5 - . . F5 - Eb5 - F5 -',
      'G5 - - - - - Bb5 - D6 - - - C6 - Bb5 -',
      'C6 - - - - - - - Bb5 - - - G5 - - -',
    ],
    kick: 'x . . . . . x . . . x . . . . .',
    snare: '. . . . x . . . . . . . x . . .',
    hat: 'x . x x x . x . x . x x x . x .',
    snareTone: [3, 0.1],
    texture: 'vinyl',
  },
]

/** How loud each pitched channel plays, matched to the jukebox. */
const LEVELS = { lead: 0.05, chord: 0.03, bass: 0.14 }

/** The kick and hi-hat as noise bursts: grit, length, and loudness. */
const KICK = [24, 0.12, 0.09] as const
const HAT = [1, 0.03, 0.025] as const

/**
 * Plays a chiptune track through the tape's lo-fi chain until stopped.
 * Returns undefined where Web Audio is missing.
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

    /** A pulse channel's wave, built from its harmonics like the jukebox's. */
    function pulseWave(duty: Duty): PeriodicWave {
      const { imag, real } = pulseTerms(duty)
      return audio.createPeriodicWave(real, imag)
    }

    const leadWave = pulseWave(track.leadDuty)
    const chordWave = pulseWave(track.chordDuty)

    /**
     * One note on a pulse wave, or on the triangle without one, bent by the
     * tape wobble. The volume drops a little after the attack, like the jukebox.
     */
    function playTone(
      wave: PeriodicWave | undefined,
      hz: number,
      time: number,
      seconds: number,
      level: number,
    ) {
      const oscillator = audio.createOscillator()
      if (wave) oscillator.setPeriodicWave(wave)
      else oscillator.type = 'triangle'
      oscillator.frequency.value = hz
      bend(oscillator)
      const gain = audio.createGain()
      gain.gain.setValueAtTime(level, time)
      gain.gain.setTargetAtTime(level * 0.6, time, 0.1)
      gain.gain.setTargetAtTime(0, time + seconds - 0.02, 0.01)
      oscillator.connect(gain).connect(filter)
      oscillator.start(time)
      oscillator.stop(time + seconds + 0.05)
    }

    /** A drum from the noise channel: grit, length, and loudness. */
    function playDrum([grit, seconds, level]: readonly [number, number, number], time: number) {
      const source = audio.createBufferSource()
      source.buffer = noiseBuffer(audio, grit)
      const gain = audio.createGain()
      gain.gain.setValueAtTime(level, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + seconds)
      source.connect(gain).connect(filter)
      source.start(time)
      source.stop(time + seconds)
    }

    return (step, time) => {
      // The modulo always lands on a chord; the array type allows undefined.
      /* v8 ignore next */
      const chord = chords[Math.floor(step / 16) % chords.length] ?? []
      const sixteenths = track.comp === 'sixteenths'
      if (sixteenths || step % 2 === 0) {
        const index = sixteenths ? step % 16 : (step % 16) / 2
        const broken = chord[index % chord.length]
        const steps = sixteenths ? 1 : 2
        if (broken) playTone(chordWave, broken, time, (steps * barSeconds) / 16, LEVELS.chord)
      }
      const bass = toneAt(lanes.bass, step)
      if (bass) playTone(undefined, bass.hz, time, (bass.steps * barSeconds) / 16, LEVELS.bass)
      const lead = toneAt(lanes.lead, step)
      if (lead) playTone(leadWave, lead.hz, time, (lead.steps * barSeconds) / 16, LEVELS.lead)
      if (noteAt(lanes.kick, step)) playDrum(KICK, time)
      if (noteAt(lanes.snare, step)) playDrum([...track.snareTone, 0.05], time)
      if (noteAt(lanes.hat, step)) playDrum(HAT, time)
    }
  })
