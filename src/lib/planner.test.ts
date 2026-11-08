import { describe, it, expect } from 'vitest'
import { buildStudyPlan, workloadUnits, remainingChapters } from './planner'
import type { Difficulty, StudyEvent } from '../types'

const TODAY = '2026-11-07'

/** Build an exam event quickly; `offset` = days from TODAY. */
function exam(
  id: string,
  offset: number,
  chapters: number,
  difficulty: Difficulty = 1,
  chaptersDone = 0,
): StudyEvent {
  const d = new Date(2026, 10, 7 + offset) // month is 0-based → 10 = November
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
  return {
    id,
    subjectId: null,
    title: id,
    type: 'exam',
    date,
    done: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    chapters,
    difficulty,
    chaptersDone,
  }
}

describe('workload helpers', () => {
  it('counts remaining chapters, never below zero', () => {
    expect(remainingChapters(exam('a', 10, 10, 1, 4))).toBe(6)
    expect(remainingChapters(exam('a', 10, 10, 1, 20))).toBe(0)
  })
  it('scales workload by difficulty', () => {
    expect(workloadUnits(exam('a', 10, 10, 1))).toBe(10) // easy ×1
    expect(workloadUnits(exam('a', 10, 10, 2))).toBe(15) // medium ×1.5
    expect(workloadUnits(exam('a', 10, 10, 3))).toBe(20) // hard ×2
  })
})

describe('buildStudyPlan', () => {
  it('returns an empty plan when there is nothing to revise', () => {
    const plan = buildStudyPlan([], { today: TODAY, dailyCapacity: 4 })
    expect(plan.sessions).toHaveLength(0)
    expect(plan.exams).toHaveLength(0)
    expect(plan.byDate).toHaveLength(0)
  })

  it('ignores non-exam, done, or chapter-less events', () => {
    const events: StudyEvent[] = [
      { ...exam('e', 10, 10), type: 'homework' },
      { ...exam('f', 10, 10), done: true },
      exam('g', 10, 0), // no chapters
    ]
    expect(buildStudyPlan(events, { today: TODAY, dailyCapacity: 4 }).exams).toHaveLength(0)
  })

  it('schedules every unit before the exam when there is enough time', () => {
    const e = exam('calc', 10, 10, 1) // 10 units, 10 days
    const plan = buildStudyPlan([e], { today: TODAY, dailyCapacity: 5 })
    const summary = plan.exams[0]

    expect(summary.totalUnits).toBe(10)
    expect(summary.scheduledUnits).toBe(10)
    expect(summary.feasible).toBe(true)

    // Total scheduled units equal the workload.
    const total = plan.sessions.reduce((s, x) => s + x.units, 0)
    expect(total).toBe(10)
  })

  it('never exceeds the daily capacity', () => {
    const plan = buildStudyPlan([exam('a', 6, 30, 1)], { today: TODAY, dailyCapacity: 4 })
    for (const day of plan.byDate) expect(day.units).toBeLessThanOrEqual(4)
  })

  it('never schedules study on or after the exam day', () => {
    const e = exam('a', 5, 12, 1)
    const plan = buildStudyPlan([e], { today: TODAY, dailyCapacity: 3 })
    for (const s of plan.sessions) expect(s.date < e.date).toBe(true)
  })

  it('spreads an easy workload evenly (paces one unit per day)', () => {
    const plan = buildStudyPlan([exam('a', 10, 10, 1)], { today: TODAY, dailyCapacity: 5 })
    // 10 units over 10 days → 1 unit on each of 10 days, not crammed up front.
    expect(plan.byDate).toHaveLength(10)
    for (const day of plan.byDate) expect(day.units).toBe(1)
  })

  it('marks an overloaded exam as not feasible', () => {
    // 100 units, only 3 days × 5 capacity = 15 units possible.
    const plan = buildStudyPlan([exam('a', 3, 100, 1)], { today: TODAY, dailyCapacity: 5 })
    const summary = plan.exams[0]
    expect(summary.feasible).toBe(false)
    expect(summary.scheduledUnits).toBe(15)
    expect(summary.requiredPerDay).toBe(Math.ceil(100 / 3))
  })

  it('prioritises the sooner exam first in the summary', () => {
    const soon = exam('soon', 3, 6, 1)
    const later = exam('later', 20, 6, 1)
    const plan = buildStudyPlan([later, soon], { today: TODAY, dailyCapacity: 4 })
    expect(plan.exams[0].examId).toBe('soon')
    expect(plan.exams[1].examId).toBe('later')
  })

  it('adapts to progress already made (chaptersDone)', () => {
    const e = exam('a', 10, 10, 1, 8) // 8 of 10 chapters done → 2 units left
    const plan = buildStudyPlan([e], { today: TODAY, dailyCapacity: 5 })
    expect(plan.exams[0].totalUnits).toBe(2)
    expect(plan.exams[0].feasible).toBe(true)
  })

  it('shares capacity between two competing exams', () => {
    const a = exam('a', 8, 12, 1)
    const b = exam('b', 8, 12, 1)
    const plan = buildStudyPlan([a, b], { today: TODAY, dailyCapacity: 6 })
    // 24 units over 8 days with capacity 6 is comfortably feasible for both.
    expect(plan.exams.every((x) => x.feasible)).toBe(true)
    for (const day of plan.byDate) expect(day.units).toBeLessThanOrEqual(6)
  })
})
