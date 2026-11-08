import { describe, it, expect } from 'vitest'
import { daysUntil, urgencyOf, todayISO } from './dates'

/** An ISO date `offset` days from the real today (midnight-safe). */
function iso(offset: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil(iso(0))).toBe(0)
  })
  it('returns 1 for tomorrow', () => {
    expect(daysUntil(iso(1))).toBe(1)
  })
  it('returns a negative number for past dates', () => {
    expect(daysUntil(iso(-3))).toBe(-3)
  })
  it('counts further-future days correctly', () => {
    expect(daysUntil(iso(10))).toBe(10)
  })
})

describe('urgencyOf', () => {
  it('flags past dates as overdue', () => {
    expect(urgencyOf(iso(-1))).toBe('overdue')
  })
  it('flags today', () => {
    expect(urgencyOf(iso(0))).toBe('today')
  })
  it('flags the next 3 days as soon', () => {
    expect(urgencyOf(iso(1))).toBe('soon')
    expect(urgencyOf(iso(3))).toBe('soon')
  })
  it('flags 4–7 days as upcoming', () => {
    expect(urgencyOf(iso(4))).toBe('upcoming')
    expect(urgencyOf(iso(7))).toBe('upcoming')
  })
  it('flags more than a week away as far', () => {
    expect(urgencyOf(iso(30))).toBe('far')
  })
})

describe('todayISO', () => {
  it('equals the zero-offset date', () => {
    expect(todayISO()).toBe(iso(0))
  })
})
