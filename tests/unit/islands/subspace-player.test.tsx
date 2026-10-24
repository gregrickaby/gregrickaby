// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as Subspace from '@/components/islands/subspace'
import type { HangUp, Phase } from '@/components/islands/subspace'

const hangUp = vi.fn()
let report: (phase: Phase) => void = () => undefined
const startTransmission = vi.fn((onPhase: (phase: Phase) => void) => {
  report = onPhase
  onPhase('dialing')
  return hangUp as HangUp | undefined
})
vi.mock('@/components/islands/subspace', async (original) => ({
  ...(await original<typeof Subspace>()),
  startTransmission,
}))

const { SubspacePlayer } = await import('@/components/islands/subspace-player')

function status() {
  return document.querySelector('[aria-live]')?.textContent ?? ''
}

afterEach(() => {
  cleanup()
  hangUp.mockClear()
  startTransmission.mockClear()
})

describe('SubspacePlayer', () => {
  it('hails until engaged, then follows the transmission', () => {
    const { container } = render(<SubspacePlayer />)
    const player = container.querySelector('aside')
    expect(player?.dataset.engaged).toBeUndefined()
    expect(container.querySelector('button svg')).not.toBeNull()
    expect(status()).toContain('Standing by')

    fireEvent.click(screen.getByRole('button', { name: 'Engage' }))
    expect(player?.dataset.engaged).toBe('true')
    expect(status()).toContain('ATDT 551-701D')
    expect(container.querySelectorAll('button span span')).toHaveLength(3)
    expect(container.querySelector('button svg')).toBeNull()
    expect(screen.getByRole('button', { name: 'Hang up' }).dataset.active).toBe('true')

    act(() => report('handshake'))
    expect(status()).toContain('Carrier detected')
    act(() => report('playing'))
    expect(status()).toContain('Connected at 28.8 Kbps')
    act(() => report('idle'))
    expect(screen.getByRole('button', { name: 'Engage' }).dataset.active).toBeUndefined()

    // The transmission ended on its own, so the next press dials again.
    fireEvent.click(screen.getByRole('button', { name: 'Engage' }))
    expect(startTransmission).toHaveBeenCalledTimes(2)
  })

  it('hangs up out loud on a second press, and quietly when the page closes', () => {
    const { unmount } = render(<SubspacePlayer />)
    fireEvent.click(screen.getByRole('button', { name: 'Engage' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hang up' }))
    expect(hangUp).toHaveBeenLastCalledWith()
    expect(status()).toBe('NO CARRIER')

    fireEvent.click(screen.getByRole('button', { name: 'Engage' }))
    unmount()
    expect(hangUp).toHaveBeenLastCalledWith({ quietly: true })
  })

  it('says so where Web Audio is missing', () => {
    startTransmission.mockImplementationOnce(() => undefined)
    render(<SubspacePlayer />)
    fireEvent.click(screen.getByRole('button', { name: 'Engage' }))
    expect(status()).toContain('no Web Audio')
  })
})
