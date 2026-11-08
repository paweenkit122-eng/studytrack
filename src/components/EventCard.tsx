import { useLanguage } from '../context/LanguageContext'
import { formatDate } from '../lib/dates'
import type { StudyEvent, Subject, EventType } from '../types'
import { CountdownBadge } from './CountdownBadge'

const TYPE_ICON: Record<EventType, string> = {
  exam: '📝',
  quiz: '✏️',
  homework: '📚',
  other: '📌',
}

export function EventCard({
  event,
  subject,
  onToggleDone,
  onEdit,
  onDelete,
}: {
  event: StudyEvent
  subject?: Subject
  onToggleDone: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t, locale } = useLanguage()

  return (
    <article className={`card ${event.done ? 'card--done' : ''}`}>
      <button
        className={`check ${event.done ? 'check--on' : ''}`}
        onClick={onToggleDone}
        aria-label={event.done ? t('action.markUndone') : t('action.markDone')}
        title={event.done ? t('action.markUndone') : t('action.markDone')}
      >
        {event.done ? '✓' : ''}
      </button>

      <div className="card__main">
        <div className="card__top">
          <span className={`type-tag type-tag--${event.type}`}>
            {TYPE_ICON[event.type]} {t(`type.${event.type}`)}
          </span>
          {!event.done && <CountdownBadge date={event.date} />}
        </div>

        <h3 className="card__title">{event.title}</h3>

        <div className="card__meta">
          {subject && (
            <span className="subject-chip">
              <span className="dot" style={{ background: subject.color }} />
              {subject.name}
              {subject.code ? ` · ${subject.code}` : ''}
            </span>
          )}
          <span className="card__date">
            📅 {formatDate(event.date, locale)}
            {event.time ? ` · ${event.time}` : ''}
          </span>
        </div>

        {event.note && <p className="card__note">{event.note}</p>}
      </div>

      <div className="card__actions">
        <button className="icon-btn" onClick={onEdit} aria-label={t('action.edit')} title={t('action.edit')}>
          ✏️
        </button>
        <button
          className="icon-btn icon-btn--danger"
          onClick={onDelete}
          aria-label={t('action.delete')}
          title={t('action.delete')}
        >
          🗑️
        </button>
      </div>
    </article>
  )
}
