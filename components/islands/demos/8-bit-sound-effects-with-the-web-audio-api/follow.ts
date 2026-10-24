/**
 * Steps a sequencer has booked, waiting for the audio clock to reach them.
 * The sequencer books notes ahead of time, so a display that lit up a step
 * as soon as it was booked would run 150 ms early.
 */
export interface Follower {
  push: (step: number, time: number) => void
  /** The latest step whose time has come since the last call, if any. */
  take: (now: number) => number | undefined
}

export function createFollower(): Follower {
  const queue: { step: number; time: number }[] = []
  return {
    push(step, time) {
      queue.push({ step, time })
    },
    take(now) {
      let current: number | undefined
      for (let next = queue[0]; next && next.time <= now; next = queue[0]) {
        current = next.step
        queue.shift()
      }
      return current
    },
  }
}
