'use client'

import { useState } from 'react'

import { playSound } from '@/components/islands/audio/sounds'
import { Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'

import { DEFAULT_PASS, formatDollars, getBreakEven, PASSES, type Pass } from './break-even'
import styles from './demos.module.css'

/** The most park days the calculator draws: a long summer trip plus a few weekends. */
export const MAX_DAYS = 30

/** The most people the calculator prices. */
export const MAX_PEOPLE = 8

/** When the pass pays for itself, for a pass and a group. */
export function describeBreakEven(pass: Pass, people: number, days: number) {
  const { breakEvenDay } = getBreakEven(pass, people, days)
  const group = people === 1 ? 'one person' : `${people} people`
  return `For ${group}, the ${pass.name} pays for itself on day ${breakEvenDay}.`
}

/**
 * A break-even calculator for Disney World annual passes. Pick a pass, set
 * the days and the group, and the answer leads: what the pass saves over
 * tickets, or how much tickets save instead. A row of pips shows which days
 * are still paying off the pass and which are free.
 */
export function BreakEvenDemo() {
  const [pass, setPass] = useState<Pass>(DEFAULT_PASS)
  const [people, setPeople] = useState(4)
  const [days, setDays] = useState(8)
  const result = getBreakEven(pass, people, days)
  const worthIt = result.savings >= 0
  function choose(next: Pass) {
    playSound('select')
    setPass(next)
  }
  function changeDays(next: number) {
    if (days < result.breakEvenDay && next >= result.breakEvenDay) playSound('coin')
    setDays(next)
  }
  return (
    <>
      <Controls label="Pass">
        {PASSES.map((option) => (
          <DemoButton
            aria-pressed={option.id === pass.id}
            key={option.id}
            onClick={() => choose(option)}
            variant="secondary"
          >
            {option.label}
          </DemoButton>
        ))}
      </Controls>
      <Controls>
        <Slider label="Park days" max={MAX_DAYS} min={1} onChange={changeDays} value={days} />
        <div className={styles.stepper}>
          <span className={styles.label}>People</span>
          <DemoButton
            aria-label="Fewer people"
            disabled={people <= 1}
            onClick={() => setPeople(people - 1)}
            variant="secondary"
          >
            -
          </DemoButton>
          <output aria-label="People" className={styles.people}>
            {people}
          </output>
          <DemoButton
            aria-label="More people"
            disabled={people >= MAX_PEOPLE}
            onClick={() => setPeople(people + 1)}
            variant="secondary"
          >
            +
          </DemoButton>
        </div>
      </Controls>
      <div aria-live="polite" className={styles.verdict} data-worth-it={worthIt}>
        <p className={styles.label}>{worthIt ? 'You save' : 'Tickets save you'}</p>
        <p className={styles.amount}>{formatDollars(Math.abs(result.savings))}</p>
        <p className={styles.detail}>{describeBreakEven(pass, people, days)}</p>
      </div>
      <dl className={styles.compare}>
        <div className={styles.cost}>
          <dt className={styles.label}>Pass, with tax</dt>
          <dd className={styles.price}>{formatDollars(result.passCost)}</dd>
        </div>
        <div className={styles.cost}>
          <dt className={styles.label}>{`Tickets for ${days} days`}</dt>
          <dd className={styles.price}>{formatDollars(result.ticketCost)}</dd>
        </div>
      </dl>
      <ol aria-label="Park days" className={styles.days}>
        {Array.from({ length: MAX_DAYS }, (_, index) => {
          const day = index + 1
          const state = day > days ? 'unused' : day < result.breakEvenDay ? 'paying' : 'free'
          return (
            <li
              aria-label={`Day ${day}: ${state === 'unused' ? 'not used' : state === 'paying' ? 'paying off the pass' : 'free'}`}
              className={styles.day}
              data-state={state}
              key={day}
            />
          )
        })}
      </ol>
      <p className={styles.legend}>
        <span data-state="paying">Paying off the pass</span>
        <span data-state="free">Free</span>
      </p>
    </>
  )
}
