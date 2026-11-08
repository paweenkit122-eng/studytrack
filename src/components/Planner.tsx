import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { buildStudyPlan } from '../lib/planner'
import { formatDate, todayISO } from '../lib/dates'
import { TYPE_COLORS } from '../lib/colors'
import type { StudyEvent, Subject } from '../types'
import { CountdownBadge } from './CountdownBadge'

export function Planner({
  events,
  subjectById,
  capacity,
  onCapacityChange,
}: {
  events: StudyEvent[]
  subjectById: Record<string, Subject>
  capacity: number
  onCapacityChange: (n: number) => void
}) {
  const { t, locale } = useLanguage()

  const plan = useMemo(
    () => buildStudyPlan(events, { today: todayISO(), dailyCapacity: capacity }),
    [events, capacity],
  )

  const colorOf = (subjectId: string | null) =>
    (subjectId && subjectById[subjectId]?.color) || TYPE_COLORS.exam

  const nameOf = (subjectId: string | null) =>
    subjectId && subjectById[subjectId] ? subjectById[subjectId].name : null

  return (
    <div className="planner">
      <div className="card-surface planner__capacity">
        <label className="field">
          <span className="field__label">{t('planner.capacity')}</span>
          <input
            className="input"
            type="number"
            min={1}
            max={24}
            value={capacity}
            onChange={(e) => onCapacityChange(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
          />
        </label>
        <p className="field__hint">{t('planner.capacityHint')}</p>
      </div>

      {plan.exams.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">📚</div>
          <h2>{t('planner.empty')}</h2>
          <p>{t('planner.emptyHint')}</p>
        </div>
      ) : (
        <>
          {/* Priority list */}
          <section className="list">
            <h2 className="list__title">{t('planner.priority')}</h2>
            <div className="list__items">
              {plan.exams.map((ex, i) => {
                const pct = ex.totalUnits ? Math.round((ex.scheduledUnits / ex.totalUnits) * 100) : 0
                return (
                  <article className="card" key={ex.examId}>
                    <div className="plan-rank" aria-hidden="true">
                      {i + 1}
                    </div>
                    <div className="card__main">
                      <div className="card__top">
                        <span className="subject-chip">
                          <span className="dot" style={{ background: colorOf(ex.subjectId) }} />
                          {nameOf(ex.subjectId) ?? ex.title}
                        </span>
                        <CountdownBadge date={ex.examDate} />
                      </div>
                      <h3 className="card__title">{ex.title}</h3>

                      <div className="plan-bar" aria-hidden="true">
                        <span
                          className={`plan-bar__fill ${ex.feasible ? '' : 'plan-bar__fill--warn'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="card__meta">
                        <span className={`status ${ex.feasible ? 'status--ok' : 'status--warn'}`}>
                          {ex.feasible ? `✅ ${t('planner.onTrack')}` : `⚠️ ${t('planner.behind')}`}
                        </span>
                        <span>{t('planner.scheduledOf', { done: ex.scheduledUnits, total: ex.totalUnits })}</span>
                        <span>📅 {formatDate(ex.examDate, locale)}</span>
                        <span>{t('planner.needPerDay', { n: ex.requiredPerDay })}</span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Day-by-day schedule */}
          <section className="list">
            <h2 className="list__title">{t('planner.schedule')}</h2>
            <div className="plan-days">
              {plan.byDate.map((day) => (
                <div className="plan-day" key={day.date}>
                  <div className="plan-day__head">
                    <span className="plan-day__date">{formatDate(day.date, locale)}</span>
                    <span className="badge badge--upcoming">{t('planner.unitsOnDay', { n: day.units })}</span>
                  </div>
                  <ul className="plan-day__list">
                    {day.sessions.map((s) => (
                      <li className="plan-session" key={s.examId}>
                        <span className="dot" style={{ background: colorOf(s.subjectId) }} />
                        <span className="plan-session__title">
                          {nameOf(s.subjectId) ? `${nameOf(s.subjectId)} · ` : ''}
                          {s.title}
                        </span>
                        <span className="plan-session__units">
                          {s.units} {t('planner.units')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
