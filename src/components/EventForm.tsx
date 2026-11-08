import { useState, type FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { makeId } from '../lib/id'
import { todayISO } from '../lib/dates'
import type { Difficulty, EventType, StudyEvent, Subject } from '../types'
import { Modal } from './Modal'

const TYPES: EventType[] = ['exam', 'quiz', 'homework', 'other']

export function EventForm({
  initial,
  defaultDate,
  subjects,
  onSave,
  onClose,
}: {
  initial?: StudyEvent
  /** Pre-selected date when adding a new item (e.g. from the calendar). */
  defaultDate?: string
  subjects: Subject[]
  onSave: (event: StudyEvent) => void
  onClose: () => void
}) {
  const { t } = useLanguage()

  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<EventType>(initial?.type ?? 'exam')
  const [subjectId, setSubjectId] = useState<string>(initial?.subjectId ?? '')
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayISO())
  const [time, setTime] = useState(initial?.time ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [chapters, setChapters] = useState(initial?.chapters?.toString() ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 2)
  const [chaptersDone, setChaptersDone] = useState(initial?.chaptersDone?.toString() ?? '')
  const [error, setError] = useState('')

  const toCount = (v: string) => (v ? Math.max(0, parseInt(v, 10) || 0) : undefined)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError(t('form.titleRequired'))
    if (!date) return setError(t('form.dateRequired'))

    const isExam = type === 'exam'
    onSave({
      id: initial?.id ?? makeId(),
      title: title.trim(),
      type,
      subjectId: subjectId || null,
      date,
      time: time || undefined,
      note: note.trim() || undefined,
      done: initial?.done ?? false,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      // Planner fields only apply to exams.
      chapters: isExam ? toCount(chapters) : undefined,
      difficulty: isExam ? difficulty : undefined,
      chaptersDone: isExam ? toCount(chaptersDone) : undefined,
    })
    onClose()
  }

  return (
    <Modal title={initial ? t('form.editEvent') : t('form.newEvent')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">{t('form.title')}</span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('form.titlePlaceholder')}
            autoFocus
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">{t('form.type')}</span>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`type.${ty}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{t('form.subject')}</span>
            <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">{t('form.noSubject')}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.code ? ` (${s.code})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field__label">{t('form.date')}</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="field">
            <span className="field__label">{t('form.time')}</span>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span className="field__label">{t('form.note')}</span>
          <textarea
            className="input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('form.notePlaceholder')}
          />
        </label>

        {type === 'exam' && (
          <div className="exam-fields">
            <p className="field__hint">💡 {t('form.plannerHint')}</p>
            <div className="field-row">
              <label className="field">
                <span className="field__label">{t('form.chapters')}</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                  placeholder="8"
                />
              </label>
              <label className="field">
                <span className="field__label">{t('form.chaptersDone')}</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={chaptersDone}
                  onChange={(e) => setChaptersDone(e.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
            <label className="field">
              <span className="field__label">{t('form.difficulty')}</span>
              <select
                className="input"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)}
              >
                <option value={1}>{t('diff.easy')}</option>
                <option value={2}>{t('diff.medium')}</option>
                <option value={3}>{t('diff.hard')}</option>
              </select>
            </label>
          </div>
        )}

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {t('action.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
