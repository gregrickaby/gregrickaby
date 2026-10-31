import type { Channel, Song } from '@/components/islands/chiptune'

export const CHANNEL_NAMES: Record<Channel, string> = {
  pulse1: 'Pulse 1',
  pulse2: 'Pulse 2',
  triangle: 'Triangle',
  noise: 'Noise',
}

/** The part each channel plays in the song. */
export const ROLES: Record<Channel, string> = {
  noise: 'Drums',
  triangle: 'Bass',
  pulse2: 'Rhythm',
  pulse1: 'Melody',
}

/** The order a band builds a song in: drums, then bass, then rhythm, then melody. */
export const BUILD_ORDER: readonly Channel[] = ['noise', 'triangle', 'pulse2', 'pulse1']

/** Four arpeggio notes, each played twice across a bar of eighth notes. */
function arpeggio(notes: string): string {
  const [a, b, c, d] = notes.split(' ')
  return `${a} . ${b} . ${c} . ${d} . ${a} . ${b} . ${c} . ${d} .`
}

/** A bouncing triangle bass bar: root, then fifth, with a pickup into the next bar. */
function bass(root: string, fifth: string): string {
  return `${root} - . ${root} ${fifth} - . ${fifth} ${root} - . ${root} ${fifth} - ${root} .`
}

const BEAT = 'k . h . s . h . k . h k s . h .'
const FILL = 's . s . s s s . s s s s k . . .'

/**
 * An original overworld tune in C major: I-vi-IV-V twice, then a bridge that
 * climbs to a big finish and loops back. Named for the Wiregrass, the corner
 * of Alabama it was written in.
 */
export const SONG: Song = {
  title: 'Wiregrass Overworld',
  bpm: 150,
  lanes: {
    pulse1: [
      'E5 . G5 . C6 - - G5 . E5 . G5 A5 - G5 .',
      'A5 - - E5 . A5 . C6 B5 - A5 . G5 - E5 .',
      'F5 . A5 . C6 - - A5 . F5 . A5 C6 - D6 .',
      'D6 - - - B5 - - - G5 - A5 - B5 - D6 -',
      'E5 . G5 . C6 - - G5 . E5 . G5 A5 - G5 .',
      'A5 - - E5 . A5 . C6 B5 - A5 . G5 - E5 .',
      'F5 . A5 . C6 - - A5 . F5 . A5 C6 - D6 .',
      'D6 . C6 . B5 . G5 . C6 - - - - - . .',
      'A5 - - C6 . A5 . F5 G5 - A5 . C6 - - .',
      'B5 - - D6 . B5 . G5 A5 - B5 . D6 - - .',
      'G5 - E5 - G5 - B5 - E6 - - - D6 - B5 -',
      'C6 - - - A5 - - - E5 - A5 - C6 - E6 -',
      'F6 - - - E6 - - - D6 - C6 - A5 - C6 -',
      'D6 - - - - - B5 . G5 . B5 . D6 . G6 .',
      'E6 . C6 . G5 . C6 . E6 . G6 - - - . .',
      'C6 . . . G5 . . . C5 . . . . . . .',
    ],
    pulse2: [
      arpeggio('C4 E4 G4 E4'),
      arpeggio('A3 C4 E4 C4'),
      arpeggio('F3 A3 C4 A3'),
      arpeggio('G3 B3 D4 B3'),
      arpeggio('C4 E4 G4 E4'),
      arpeggio('A3 C4 E4 C4'),
      arpeggio('F3 A3 C4 A3'),
      arpeggio('G3 B3 D4 B3'),
      arpeggio('F3 A3 C4 A3'),
      arpeggio('G3 B3 D4 B3'),
      arpeggio('E4 G4 B4 G4'),
      arpeggio('A3 C4 E4 C4'),
      arpeggio('F3 A3 C4 A3'),
      arpeggio('G3 B3 D4 B3'),
      arpeggio('C4 E4 G4 E4'),
      arpeggio('C4 E4 G4 E4'),
    ],
    triangle: [
      bass('C3', 'G2'),
      bass('A2', 'E2'),
      bass('F2', 'C3'),
      bass('G2', 'D3'),
      bass('C3', 'G2'),
      bass('A2', 'E2'),
      bass('F2', 'C3'),
      bass('G2', 'D3'),
      bass('F2', 'C3'),
      bass('G2', 'D3'),
      bass('E2', 'B2'),
      bass('A2', 'E2'),
      bass('F2', 'C3'),
      bass('G2', 'D3'),
      bass('C3', 'G2'),
      bass('C3', 'G2'),
    ],
    noise: [...Array.from({ length: 15 }, () => BEAT), FILL],
  },
}
