/**
 * Generate a short unique id for subjects and events.
 * Uses the browser's crypto.randomUUID when available, with a
 * timestamp-based fallback for older environments.
 */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
