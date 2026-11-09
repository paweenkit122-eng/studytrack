import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useLanguage } from '../context/LanguageContext'
import { dueReminders } from '../lib/reminders'
import { todayISO } from '../lib/dates'
import type { StudyEvent } from '../types'

/** Browser support check (also false in jsdom/tests → the hook no-ops). */
export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window

/**
 * Shows a browser notification for each exam that has just reached a reminder
 * threshold (7/3/1/0 days before), when reminders are enabled and permission
 * is granted. Notified thresholds are remembered so they never repeat.
 *
 * Note: as a client-only PWA this fires while the app is open (and on open);
 * true background push would need the Push API + a server.
 */
export function useReminders(events: StudyEvent[], enabled: boolean) {
  const { t } = useLanguage()
  const [notified, setNotified] = useLocalStorage<string[]>('studytrack.notified', [])

  useEffect(() => {
    if (!enabled || !notificationsSupported()) return
    if (Notification.permission !== 'granted') return

    const seen = new Set(notified)
    const due = dueReminders(events, { today: todayISO(), notified: seen })
    if (due.length === 0) return

    for (const r of due) {
      const body =
        r.days === 0
          ? t('reminder.bodyToday', { title: r.title })
          : r.days === 1
            ? t('reminder.bodyTomorrow', { title: r.title })
            : t('reminder.bodyDays', { title: r.title, n: r.days })
      try {
        new Notification(t('reminder.title'), { body, tag: r.key })
      } catch {
        // some environments throw if not triggered by a user gesture — ignore
      }
      seen.add(r.key)
    }
    setNotified([...seen])
  }, [events, enabled, notified, t, setNotified])
}
