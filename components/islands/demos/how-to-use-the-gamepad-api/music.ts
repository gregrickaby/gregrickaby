import type { Song } from '@/components/islands/chiptune'

/** A pulse chord stab on the "and" of every beat, the bounce under an overworld tune. */
function stabs(low: string, high: string): string {
  return `. . ${low} . . . ${high} . . . ${low} . . . ${high} .`
}

/** A triangle bass bar that hops from the root to the fifth and back. */
function hop(root: string, fifth: string): string {
  return `${root} . . ${root} ${fifth} . . . ${root} . . ${root} ${fifth} . ${root} .`
}

const BEAT = 'k . h . s . h h k . h k s . h .'
const ROLL = 'k . h . s . h h k . s s s s s .'

/**
 * The level's music: an original overworld tune in G major, written in the
 * style of an NES platformer. Eight bars over G, E minor, C, and D, with a
 * syncopated hook that loops while the ghost is alive.
 */
export const LEVEL_SONG: Song = {
  title: 'Cassette Hunt',
  bpm: 140,
  lanes: {
    pulse1: [
      'D5 . G5 . B5 - A5 G5 . . D5 . G5 - - .',
      'E5 . G5 . B5 - C6 B5 - A5 . G5 E5 - - .',
      'C5 . E5 . G5 - A5 . C6 - B5 . A5 - G5 .',
      'F#5 . A5 . D6 - - . C6 . B5 . A5 - F#5 .',
      'D5 . G5 . B5 - A5 G5 . . D5 . G5 - - .',
      'E5 . G5 . B5 - D6 . E6 - D6 . B5 - G5 .',
      'C6 . . A5 . . C6 . D6 . . B5 . . D6 .',
      'G6 - . D6 . B5 . G5 . . . . . . . .',
    ],
    pulse2: [
      stabs('B4', 'D5'),
      stabs('G4', 'B4'),
      stabs('E4', 'G4'),
      stabs('F#4', 'A4'),
      stabs('B4', 'D5'),
      stabs('G4', 'B4'),
      stabs('E4', 'A4'),
      stabs('B4', 'D5'),
    ],
    triangle: [
      hop('G2', 'D3'),
      hop('E2', 'B2'),
      hop('C3', 'G2'),
      hop('D3', 'A2'),
      hop('G2', 'D3'),
      hop('E2', 'B2'),
      hop('C3', 'D3'),
      hop('G2', 'D3'),
    ],
    noise: [BEAT, BEAT, BEAT, BEAT, BEAT, BEAT, BEAT, ROLL],
  },
}
