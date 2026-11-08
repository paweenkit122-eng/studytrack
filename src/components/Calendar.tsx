import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { formatDate } from '../lib/dates'
import { TYPE_COLORS } from '../lib/colors'
import type { StudyEvent, Subject } from '../types'
import { EventCard } from './EventCard'

/** Local-time "YYYY-MM-DD" for a Date (avoids UTC off-by-one bugs). */
function toISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function Calendar({
  events,
  subjectById,
  onEdit,
  onDelete,
  onToggleDone,
  onAddOnDate,
}: {
  events: StudyEvent[]
  subjectById: Record<string, Subject>
  onEdit: (event: StudyEvent) => void
  onDelete: (id: string) => void
  onToggleDone: (id: string) => void
  onAddOnDate: (iso: string) => void
}) {
  const { t, locale } = useLanguage()

  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<string>(toISO(today))

  // Group events by date once: { "2026-11-09": [event, ...] }
  const byDate = useMemo(() => {
    const map: Record<string, StudyEvent[]> = {}
    for (const e of events) (map[e.date] ??= []).push(e)
    for (const list of Object.values(map)) {
      list.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '') || a.title.localeCompare(b.title))
    }
    return map
  }, [events])

  // Localised weekday headers (Sun … Sat).
  const weekdays = useMemo(() => {
    const sunday = new Date(2024, 0, 7) // a known Sunday
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      return fmt.format(d)
    })
  }, [locale])

  // Build a 6×7 grid starting from the Sunday on/before the 1st of the month.
  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay())
    const todayISO = toISO(today)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      const iso = toISO(d)
      return {
        iso,
        day: d.getDate(),
        month: d.getMonth(),
        inMonth: d.getMonth() === month,
        isToday: iso === todayISO,
        items: byDate[iso] ?? [],
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, byDate])

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor)
  const selectedItems = byDate[selected] ?? []

  const moveMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))

  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(toISO(today))
  }

  const pickDay = (iso: string, month: number) => {
    setSelected(iso)
    if (month !== cursor.getMonth()) setCursor(new Date(iso + 'T00:00:00'))
  }

  function dotColor(e: StudyEvent): string {
    if (e.subjectId && subjectById[e.subjectId]) return subjectById[e.subjectId].color
    return TYPE_COLORS[e.type] ?? TYPE_COLORS.other
  }

  return (
    <div className="calendar">
      <div className="cal__bar">
        <button className="icon-btn" onClick={() => moveMonth(-1)} aria-label={t('cal.prev')}>
          ‹
        </button>
        <h2 className="cal__title">{monthTitle}</h2>
        <button className="icon-btn" onClick={() => moveMonth(1)} aria-label={t('cal.next')}>
          ›
        </button>
        <button className="btn btn--ghost btn--sm cal__today" onClick={goToday}>
          {t('cal.today')}
        </button>
      </div>

      <div className="cal__grid cal__grid--head">
        {weekdays.map((w) => (
          <div key={w} className="cal__weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="cal__grid">
        {cells.map((c) => (
          <button
            key={c.iso}
            className={`cal__cell ${c.inMonth ? '' : 'cal__cell--out'} ${
              c.isToday ? 'cal__cell--today' : ''
            } ${c.iso === selected ? 'cal__cell--selected' : ''}`}
            onClick={() => pickDay(c.iso, c.month)}
          >
            <span className="cal__daynum">{c.day}</span>
            {c.items.length > 0 && (
              <span className="cal__dots">
                {c.items.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className="cal__dot"
                    style={{ background: dotColor(e), opacity: e.done ? 0.35 : 1 }}
                  />
                ))}
                {c.items.length > 3 && <span className="cal__more">+{c.items.length - 3}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="cal__day-panel">
        <div className="cal__day-head">
          <h3 className="cal__day-title">{formatDate(selected, locale)}</h3>
          <button className="btn btn--primary btn--sm" onClick={() => onAddOnDate(selected)}>
            {t('cal.addOnDay')}
          </button>
        </div>

        {selectedItems.length === 0 ? (
          <p className="muted cal__empty">{t('cal.noEvents')}</p>
        ) : (
          <div className="list__items">
            {selectedItems.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                subject={event.subjectId ? subjectById[event.subjectId] : undefined}
                onToggleDone={() => onToggleDone(event.id)}
                onEdit={() => onEdit(event)}
                onDelete={() => onDelete(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
