/**
 * One demo plays at a time: starting one stops whichever demo had the
 * speakers. Each demo claims them with an owner that stays the same across
 * renders, such as one of its refs, so a demo that restarts itself (like the
 * tape deck moving to its next track) doesn't stop itself.
 */
let current: { owner: object; stop: () => void } | undefined

export function claimSpeakers(owner: object, stop: () => void) {
  const previous = current
  current = { owner, stop }
  if (previous && previous.owner !== owner) previous.stop()
}

export function releaseSpeakers(owner: object) {
  if (current?.owner === owner) current = undefined
}
