import type { AppData } from '../types'
import { makeId } from './id'
import { SUBJECT_COLORS } from './colors'

/** ISO date `days` from today — keeps the sample countdowns realistic. */
function inDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/**
 * Example data shown only on the very first visit (when nothing is saved yet).
 * It makes the app feel alive and is easy to delete.
 */
export function seedData(): AppData {
  const dataStruct = makeId()
  const calculus = makeId()
  const now = new Date().toISOString()

  return {
    subjects: [
      { id: dataStruct, name: 'Data Structures', code: 'CPE231', color: SUBJECT_COLORS[0] },
      { id: calculus, name: 'Calculus II', code: 'MTH102', color: SUBJECT_COLORS[3] },
    ],
    events: [
      {
        id: makeId(),
        subjectId: calculus,
        title: 'Quiz: Integration',
        type: 'quiz',
        date: inDays(2),
        note: 'Ch. 5 only',
        done: false,
        createdAt: now,
      },
      {
        id: makeId(),
        subjectId: dataStruct,
        title: 'Homework 4 — Linked Lists',
        type: 'homework',
        date: inDays(4),
        time: '23:59',
        note: 'Submit on the course portal',
        done: false,
        createdAt: now,
      },
      {
        id: makeId(),
        subjectId: dataStruct,
        title: 'Midterm Exam',
        type: 'exam',
        date: inDays(9),
        time: '09:00',
        note: 'Room 4201 · chapters 1–6',
        done: false,
        createdAt: now,
        chapters: 6,
        difficulty: 3,
        chaptersDone: 1,
      },
      {
        id: makeId(),
        subjectId: calculus,
        title: 'Final Exam',
        type: 'exam',
        date: inDays(21),
        time: '13:00',
        note: 'Comprehensive · chapters 1–10',
        done: false,
        createdAt: now,
        chapters: 10,
        difficulty: 2,
        chaptersDone: 0,
      },
    ],
  }
}
