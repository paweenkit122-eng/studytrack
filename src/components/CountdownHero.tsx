import { useLanguage } from '../context/LanguageContext'
import { formatDate } from '../lib/dates'
import type { StudyEvent, Subject } from '../types'
import { CountdownBadge } from './CountdownBadge'

/**
 * The big banner at the top showing the single most urgent, not-yet-done item
 * (the soonest by date). When nothing is pending it shows an "all caught up"
 * message instead.
 */
export function CountdownHero({
  event,
  subject,
}: {
  event?: StudyEvent
  subject?: Subject
}) {
  const { t, locale } = useLanguage()

  if (!event) {
    return (
      <section className="hero hero--empty">
        <p className="hero__clear">{t('hero.allClear')}</p>
        <p className="hero__clear-sub">{t('hero.allClearSub')}</p>
      </section>
    )
  }

  return (
    <section className="hero">
      <span className="hero__label">{t('hero.nextUp')}</span>
      <div className="hero__count">
        <CountdownBadge date={event.date} large />
      </div>
      <h2 className="hero__title">{event.title}</h2>
      <p className="hero__meta">
        {subject ? `${subject.name} · ` : ''}
        {formatDate(event.date, locale)}
        {event.time ? ` · ${event.time}` : ''}
      </p>
    </section>
  )
}
