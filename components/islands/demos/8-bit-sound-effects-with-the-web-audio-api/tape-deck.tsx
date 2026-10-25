'use client'

import { TapeDeck } from '@/components/islands/tape-deck'

import { startTape, TRACKS } from './lofi'

/** The post's cassette deck, playing chiptune tracks through a worn-out tape. */
export function TapeDemo() {
  return <TapeDeck startTape={startTape} tracks={TRACKS} />
}
