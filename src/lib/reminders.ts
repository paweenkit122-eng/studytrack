import type { EventType, StudyEvent } from '../types'
import { daysBetween } from './dates'

// ============================================================
// Reminder logic — PURE (no DOM/Notification), so it is unit-tested.
// Decides which exams should trigger a reminder *right now*, given the
// reminder thresholds (e.g. 7/3/1/0 days before) and which reminders have
// already been shown.
// ============================================================

export interface Reminder {
  eventId: string
  title: string
  /** Actual days until the exam (0 = today). */
  days: number
  /** Dedupe key `${eventId}:${threshold}` — one notification per threshold. */
  key: string
}

export interface ReminderOptions {
  today: string
  /** Thresholds in days-before. Default [7, 3, 1, 0]. */
  offsets?: number[]
  /** Keys already notified (so we don't repeat). */
  notified: Set<string>
  /** Which event types to remind about. Default ['exam']. */
  types?: EventType[]
}

/**
 * For each eligible exam, find the *tightest* threshold bucket it now falls
 * into — the smallest offset that is still ≥ days-until (e.g. 5 days out → the
 * "7" bucket; 3 days out → the "3" bucket) — and emit a reminder for it unless
 * one was already shown. As the exam gets closer it crosses 3, then 1, then 0,
 * each firing exactly once.
 */
export function dueReminders(events: StudyEvent[], options: ReminderOptions): Reminder[] {
  const offsets = (options.offsets ?? [7, 3, 1, 0]).slice().sort((a, b) => a - b)
  const types = options.types ?? ['exam']
  const out: Reminder[] = []

  for (const e of events) {
    if (e.done || !types.includes(e.type)) continue
    const days = daysBetween(options.today, e.date)
    if (days < 0) continue // already past
    const threshold = offsets.find((o) => days <= o)
    if (threshold === undefined) continue // further away than the largest threshold
    const key = `${e.id}:${threshold}`
    if (options.notified.has(key)) continue
    out.push({ eventId: e.id, title: e.title, days, key })
  }

  return out
}
