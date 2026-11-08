/** A friendly, accessible palette to pick a subject colour from. */
export const SUBJECT_COLORS = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6',
]

/** Fallback dot colour per event type when an item has no subject. */
export const TYPE_COLORS: Record<string, string> = {
  exam: '#ef4444',
  quiz: '#f59e0b',
  homework: '#2563eb',
  other: '#8b8fa6',
}
