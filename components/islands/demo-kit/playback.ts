import { useEffect, useRef, useState } from 'react'

import { getContext, playNotes, type Note, type PlayOptions } from '@/components/islands/sounds'

import { claimSpeakers, releaseSpeakers } from './speakers'

/**
 * Plays notes through {@link playNotes} and follows along, so a demo can light
 * up its button, plot, and rows in time with the sound. `note` is the index
 * of the note sounding now, or -1 when nothing plays. The notes run through
 * their own gain node, so another demo starting can cut them off.
 */
export function usePlayback() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const output = useRef<GainNode | undefined>(undefined)
  const [note, setNote] = useState(-1)

  useEffect(() => {
    const pending = timers.current
    const owner = timers
    return () => {
      for (const timer of pending) clearTimeout(timer)
      output.current?.disconnect()
      releaseSpeakers(owner)
    }
  }, [])

  function at(seconds: number, then: () => void) {
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      then()
    }, seconds * 1000)
    timers.current.add(timer)
  }

  function stop() {
    for (const timer of timers.current) clearTimeout(timer)
    timers.current.clear()
    output.current?.disconnect()
    output.current = undefined
    releaseSpeakers(timers)
    setNote(-1)
  }

  function play(notes: readonly Note[], options?: PlayOptions) {
    const audio = getContext()
    if (!audio) return
    stop()
    claimSpeakers(timers, stop)
    const destination = audio.createGain()
    destination.connect(audio.destination)
    output.current = destination
    playNotes(notes, { ...options, destination })
    setNote(0)
    let start = 0
    for (const [i, [, seconds]] of notes.entries()) {
      if (i > 0) at(start, () => setNote(i))
      start += seconds
    }
    at(start, stop)
  }

  return { note, play, playing: note !== -1, stop }
}
