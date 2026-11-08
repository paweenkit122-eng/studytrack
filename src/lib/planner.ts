import type { Difficulty, StudyEvent } from '../types'

// ============================================================
// Smart Study Planner
// ------------------------------------------------------------
// A PURE module (no React, no DOM) that turns a set of exams —
// each with a date, a chapter count and a difficulty — into a
// day-by-day revision schedule. Because it is pure, it is fully
// unit-tested in planner.test.ts.
//
// Core idea (a greedy, deadline-aware scheduler):
//   1. Estimate each exam's workload in "revision units"
//      (chapters × a difficulty factor).
//   2. Walk forward one day at a time. Each day we have a fixed
//      capacity of units. We hand each unit to the exam under the
//      most time pressure right now:
//          pressure = unitsLeft / daysLeftUntilExam
//      Recomputing pressure after every unit keeps subjects balanced
//      and automatically front-loads whatever is falling behind —
//      which is exactly how the plan "adapts" when you're behind.
// ============================================================

/** Extra effort hard subjects need: a hard chapter ≈ 2× an easy one. */
export const DIFFICULTY_FACTOR: Record<Difficulty, number> = { 1: 1, 2: 1.5, 3: 2 }

export interface PlanSession {
  date: string
  examId: string
  subjectId: string | null
  title: string
  /** Revision units to do for this exam on this day. */
  units: number
}

export interface ExamPlan {
  examId: string
  title: string
  subjectId: string | null
  examDate: string
  /** Days from today until the exam (study days available). */
  daysLeft: number
  /** Total revision units needed (remaining chapters × difficulty). */
  totalUnits: number
  /** Units the schedule managed to fit before the exam. */
  scheduledUnits: number
  /** Units/day needed to finish in time, ignoring other exams. */
  requiredPerDay: number
  /** True when every unit fits before the exam date. */
  feasible: boolean
}

export interface StudyPlan {
  /** Every (day, exam) allocation, in chronological order. */
  sessions: PlanSession[]
  /** The same sessions grouped by day, for rendering. */
  byDate: { date: string; sessions: PlanSession[]; units: number }[]
  /** One summary per exam, ordered by revision priority (most urgent first). */
  exams: ExamPlan[]
}

export interface PlanOptions {
  /** Today as ISO "YYYY-MM-DD". */
  today: string
  /** Maximum revision units a student can do per day. */
  dailyCapacity: number
}

/** Remaining chapters for an exam (never negative). */
export function remainingChapters(e: StudyEvent): number {
  return Math.max(0, (e.chapters ?? 0) - (e.chaptersDone ?? 0))
}

/** Workload in revision units = remaining chapters × difficulty factor (rounded up). */
export function workloadUnits(e: StudyEvent): number {
  const factor = DIFFICULTY_FACTOR[e.difficulty ?? 2]
  return Math.ceil(remainingChapters(e) * factor)
}

/** Add `n` days to an ISO date string, returning a new ISO date string. */
function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, (d ?? 1) + n)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

/** Whole days from `fromISO` to `toISO` (pure, so the planner is deterministic). */
function diffDays(fromISO: string, toISO: string): number {
  const [y1, m1, d1] = fromISO.split('-').map(Number)
  const [y2, m2, d2] = toISO.split('-').map(Number)
  const a = new Date(y1, (m1 ?? 1) - 1, d1 ?? 1).getTime()
  const b = new Date(y2, (m2 ?? 1) - 1, d2 ?? 1).getTime()
  return Math.round((b - a) / 86_400_000)
}

interface Work {
  e: StudyEvent
  offset: number // days from today until the exam
  total: number // total revision units
  left: number // units still unscheduled (mutated during scheduling)
}

/** Build a full revision plan from a list of events. */
export function buildStudyPlan(events: StudyEvent[], options: PlanOptions): StudyPlan {
  const capacity = Math.max(1, Math.floor(options.dailyCapacity))

  // Eligible = an upcoming exam that still has chapters left to revise.
  const work: Work[] = events
    .filter((e) => e.type === 'exam' && !e.done && workloadUnits(e) > 0)
    .map((e) => ({
      e,
      offset: diffDays(options.today, e.date),
      total: workloadUnits(e),
      left: workloadUnits(e),
    }))
    .filter((w) => w.offset >= 0)

  // Per-day, per-exam unit tallies, keyed by day offset.
  const tally = new Map<number, Map<string, number>>()
  const addUnits = (offset: number, id: string, n: number) => {
    const day = tally.get(offset) ?? new Map<string, number>()
    day.set(id, (day.get(id) ?? 0) + n)
    tally.set(offset, day)
  }

  const horizon = work.reduce((max, w) => Math.max(max, w.offset), 0)

  for (let o = 0; o <= horizon; o++) {
    let capLeft = capacity

    // Exams we can still revise for today: unfinished and not yet sat.
    const open = work.filter((w) => w.left > 0 && w.offset > o)

    // Most time pressure first, so when capacity is tight the urgent exam wins.
    open.sort((a, b) => {
      const pa = a.left / (a.offset - o)
      const pb = b.left / (b.offset - o)
      if (pb !== pa) return pb - pa // higher pressure first
      if (a.offset !== b.offset) return a.offset - b.offset // sooner exam first
      const da = b.e.difficulty ?? 2
      const db = a.e.difficulty ?? 2
      if (da !== db) return da - db // harder first
      return a.e.id.localeCompare(b.e.id) // stable tie-break
    })

    for (const w of open) {
      if (capLeft <= 0) break
      // Units/day needed to stay exactly on pace to finish by the exam.
      const pace = Math.ceil(w.left / (w.offset - o))
      const give = Math.min(pace, capLeft, w.left)
      if (give > 0) {
        w.left -= give
        capLeft -= give
        addUnits(o, w.e.id, give)
      }
    }
  }

  // ---- Assemble the output ----
  const sessions: PlanSession[] = []
  for (const [offset, day] of [...tally.entries()].sort((a, b) => a[0] - b[0])) {
    for (const w of work) {
      const units = day.get(w.e.id)
      if (units) {
        sessions.push({
          date: addDaysISO(options.today, offset),
          examId: w.e.id,
          subjectId: w.e.subjectId,
          title: w.e.title,
          units,
        })
      }
    }
  }

  const byDateMap = new Map<string, PlanSession[]>()
  for (const s of sessions) (byDateMap.get(s.date) ?? byDateMap.set(s.date, []).get(s.date)!).push(s)
  const byDate = [...byDateMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, list]) => ({
      date,
      sessions: list,
      units: list.reduce((sum, s) => sum + s.units, 0),
    }))

  const exams: ExamPlan[] = work
    .map((w) => {
      const scheduled = w.total - w.left
      return {
        examId: w.e.id,
        title: w.e.title,
        subjectId: w.e.subjectId,
        examDate: w.e.date,
        daysLeft: w.offset,
        totalUnits: w.total,
        scheduledUnits: scheduled,
        requiredPerDay: w.offset > 0 ? Math.ceil(w.total / w.offset) : Infinity,
        feasible: w.left === 0,
      }
    })
    .sort((a, b) => a.daysLeft - b.daysLeft || b.requiredPerDay - a.requiredPerDay)

  return { sessions, byDate, exams }
}
