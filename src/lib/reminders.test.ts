import { describe, it, expect } from 'vitest'
import { dueReminders } from './reminders'
import type { StudyEvent } from '../types'

const TODAY = '2026-11-07'

function exam(id: string, date: string, extra: Partial<StudyEvent> = {}): StudyEvent {
  return {
    id,
    subjectId: null,
    title: id,
    type: 'exam',
    date,
    done: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  }
}

const none = () => new Set<string>()

describe('dueReminders', () => {
  it('fires the 7-day bucket for an exam a week away', () => {
    const r = dueReminders([exam('a', '2026-11-14')], { today: TODAY, notified: none() })
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ eventId: 'a', days: 7, key: 'a:7' })
  })

  it('does not fire when the exam is further than the largest threshold', () => {
    const r = dueReminders([exam('a', '2026-11-20')], { today: TODAY, notified: none() }) // 13 days
    expect(r).toHaveLength(0)
  })

  it('uses the 3-day bucket when 3 days out', () => {
    const r = dueReminders([exam('a', '2026-11-10')], { today: TODAY, notified: none() })
    expect(r[0].key).toBe('a:3')
  })

  it('uses the 0 (today) bucket on exam day', () => {
    const r = dueReminders([exam('a', TODAY)], { today: TODAY, notified: none() })
    expect(r[0]).toMatchObject({ days: 0, key: 'a:0' })
  })

  it('does not repeat an already-notified threshold', () => {
    const r = dueReminders([exam('a', '2026-11-14')], {
      today: TODAY,
      notified: new Set(['a:7']),
    })
    expect(r).toHaveLength(0)
  })

  it('skips done and past exams', () => {
    const events = [exam('done', '2026-11-14', { done: true }), exam('past', '2026-11-01')]
    expect(dueReminders(events, { today: TODAY, notified: none() })).toHaveLength(0)
  })

  it('ignores non-exam types by default but can include them', () => {
    const hw = exam('hw', '2026-11-10', { type: 'homework' })
    expect(dueReminders([hw], { today: TODAY, notified: none() })).toHaveLength(0)
    const r = dueReminders([hw], { today: TODAY, notified: none(), types: ['exam', 'homework'] })
    expect(r).toHaveLength(1)
  })
})
