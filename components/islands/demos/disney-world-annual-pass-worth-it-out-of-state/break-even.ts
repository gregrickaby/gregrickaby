/** Orange County, Florida sales tax, which Disney adds to every annual pass. */
export const TAX_RATE = 0.065

const PIXIE_DUST = {
  id: 'pixie-dust',
  label: 'Pixie Dust',
  name: 'Pixie Dust Pass',
  price: 499,
} as const
const PIRATE = { id: 'pirate', label: 'Pirate', name: 'Pirate Pass', price: 909 } as const
const SORCERER = { id: 'sorcerer', label: 'Sorcerer', name: 'Sorcerer Pass', price: 1139 } as const
const INCREDI = { id: 'incredi', label: 'Incredi-Pass', name: 'Incredi-Pass', price: 1749 } as const

/**
 * Every Walt Disney World annual pass, from the lowest tier to the highest, at
 * new-buyer prices as of October 6, 2026: per person, before tax. Out-of-state
 * buyers can get the top two.
 */
export const PASSES = [PIXIE_DUST, PIRATE, SORCERER, INCREDI] as const

/** The pass the calculator starts on: the one most out-of-state buyers can choose. */
export const DEFAULT_PASS: Pass = SORCERER

export type Pass = (typeof PASSES)[number]

/**
 * One day on a 4-day park hopper ticket in 2026: the median adult 4-day ticket
 * ($659) plus the hopper add-on ($95), divided by four, rounded to the dollar.
 */
export const TICKET_PER_DAY = 189

/** What the passes cost for the whole group, with tax, rounded to the cent. */
export function getPassCost(price: number, people: number): number {
  return Math.round(price * people * (1 + TAX_RATE) * 100) / 100
}

/** The park day on which the passes cost less than buying tickets for every day so far. */
export function getBreakEvenDay(passCost: number, ticket: number, people: number): number {
  return Math.ceil(passCost / (ticket * people))
}

/** Everything the calculator shows for a pass, a group, and a number of days. */
export function getBreakEven(pass: Pass, people: number, days: number, ticket = TICKET_PER_DAY) {
  const passCost = getPassCost(pass.price, people)
  const ticketCost = ticket * people * days
  return {
    passCost,
    ticketCost,
    breakEvenDay: getBreakEvenDay(passCost, ticket, people),
    savings: ticketCost - passCost,
  }
}

const DOLLARS = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

/** A dollar amount rounded to the dollar, with a minus sign when it's negative: "$4,128". */
export function formatDollars(amount: number): string {
  return DOLLARS.format(Math.round(amount))
}
