import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '../context/LanguageContext'
import { CountdownBadge } from './CountdownBadge'

function iso(offset: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const withLang = (ui: React.ReactElement) => render(<LanguageProvider>{ui}</LanguageProvider>)

beforeEach(() => localStorage.clear())

describe('CountdownBadge', () => {
  it('shows the number of days remaining', () => {
    withLang(<CountdownBadge date={iso(3)} />)
    // e.g. Thai "เหลืออีก 3 วัน" / English "3 days left" — assert the count appears.
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('shows a word label (no digit) for today', () => {
    withLang(<CountdownBadge date={iso(0)} />)
    expect(screen.queryByText(/\d/)).toBeNull()
  })
})
