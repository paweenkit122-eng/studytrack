import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '../context/LanguageContext'
import { EventCard } from './EventCard'
import type { StudyEvent } from '../types'

const event: StudyEvent = {
  id: '1',
  subjectId: null,
  title: 'Data Structures midterm',
  type: 'exam',
  date: '2099-01-01',
  done: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

const noop = () => {}

beforeEach(() => {
  localStorage.clear()
  // Pin English so we can assert on stable aria-labels.
  localStorage.setItem('studytrack.lang', JSON.stringify('en'))
})

describe('EventCard', () => {
  it('renders the title and type tag', () => {
    render(
      <LanguageProvider>
        <EventCard event={event} onToggleDone={noop} onEdit={noop} onDelete={noop} />
      </LanguageProvider>,
    )
    expect(screen.getByText('Data Structures midterm')).toBeInTheDocument()
    expect(screen.getByText(/Exam/)).toBeInTheDocument()
  })

  it('calls onToggleDone when the check button is clicked', async () => {
    const onToggleDone = vi.fn()
    render(
      <LanguageProvider>
        <EventCard event={event} onToggleDone={onToggleDone} onEdit={noop} onDelete={noop} />
      </LanguageProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(onToggleDone).toHaveBeenCalledTimes(1)
  })
})
