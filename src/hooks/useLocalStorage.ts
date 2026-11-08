import { useEffect, useState } from 'react'

/**
 * A useState that persists to localStorage.
 *
 * - Reads the saved value once on first render (falls back to `initialValue`).
 * - Writes back to localStorage whenever the value changes.
 * - Every read/write is wrapped in try/catch so private mode or a full /
 *   blocked storage can never crash the app.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore: storage may be unavailable (private mode, quota, etc.).
    }
  }, [key, value])

  return [value, setValue] as const
}
