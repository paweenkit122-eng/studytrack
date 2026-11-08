// ---- Domain types shared across the whole app ----

/** Kind of thing a student wants to remember. Drives the icon/colour of each card. */
export type EventType = 'exam' | 'quiz' | 'homework' | 'other'

/** How hard a subject is — feeds the Smart Study Planner's workload estimate. */
export type Difficulty = 1 | 2 | 3

/** A course/subject, e.g. "Data Structures (CPE231)". */
export interface Subject {
  id: string
  name: string
  code?: string
  /** CSS colour used as the subject's accent dot. */
  color: string
}

/**
 * Anything that happens on a date: a midterm, a quiz, a homework deadline, etc.
 * The countdown on every card is derived from `date`.
 */
export interface StudyEvent {
  id: string
  subjectId: string | null
  title: string
  type: EventType
  /** ISO date string, "YYYY-MM-DD". */
  date: string
  /** Optional time of day, "HH:mm". */
  time?: string
  /** Free-form note: room, chapters to review, what the homework covers, etc. */
  note?: string
  /** Marked finished / handed in. */
  done: boolean
  createdAt: string

  // ---- Smart Study Planner fields (used for exams) ----
  /** Total chapters/topics to revise before this exam. */
  chapters?: number
  /** Subjective difficulty, scales the revision workload. */
  difficulty?: Difficulty
  /** Chapters already revised — lets the planner adapt as you progress. */
  chaptersDone?: number
}

/** The whole app state we persist to localStorage and can export/import as JSON. */
export interface AppData {
  subjects: Subject[]
  events: StudyEvent[]
}
