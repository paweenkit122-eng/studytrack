// ---- Date helpers for the countdown logic ----

/** Midnight (local time) of today. Used so "days left" ignores the time of day. */
function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Parse an ISO "YYYY-MM-DD" string into a local Date at midnight. */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/**
 * Whole days from today until the given date.
 *   0  -> today
 *   1  -> tomorrow
 *  -2  -> two days ago (overdue)
 */
export function daysUntil(iso: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = parseDate(iso).getTime() - startOfToday().getTime()
  return Math.round(diff / msPerDay)
}

/** Whole days from one ISO date to another, both taken at local midnight. */
export function daysBetween(fromISO: string, toISO: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((parseDate(toISO).getTime() - parseDate(fromISO).getTime()) / msPerDay)
}

/** Urgency bucket used to colour the countdown badge. */
export type Urgency = 'overdue' | 'today' | 'soon' | 'upcoming' | 'far'

export function urgencyOf(iso: string): Urgency {
  const d = daysUntil(iso)
  if (d < 0) return 'overdue'
  if (d === 0) return 'today'
  if (d <= 3) return 'soon'
  if (d <= 7) return 'upcoming'
  return 'far'
}

/** Format an ISO date for display, e.g. "Mon, 9 Mar 2026", localised. */
export function formatDate(iso: string, locale: string): string {
  return parseDate(iso).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Today as an ISO "YYYY-MM-DD" string — handy as a form default/min. */
export function todayISO(): string {
  const t = startOfToday()
  const mm = String(t.getMonth() + 1).padStart(2, '0')
  const dd = String(t.getDate()).padStart(2, '0')
  return `${t.getFullYear()}-${mm}-${dd}`
}
