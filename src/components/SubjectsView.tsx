import { useState, type FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { makeId } from '../lib/id'
import { SUBJECT_COLORS } from '../lib/colors'
import type { Subject } from '../types'

/**
 * The "Subjects" tab: add a course (name, code, colour) and see/delete
 * the ones you have. Shown as a full view in the main area.
 */
export function SubjectsView({
  subjects,
  onAdd,
  onDelete,
}: {
  subjects: Subject[]
  onAdd: (subject: Subject) => void
  onDelete: (id: string) => void
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [color, setColor] = useState(SUBJECT_COLORS[0])

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ id: makeId(), name: name.trim(), code: code.trim() || undefined, color })
    setName('')
    setCode('')
    setColor(SUBJECT_COLORS[(subjects.length + 1) % SUBJECT_COLORS.length])
  }

  function handleDelete(id: string) {
    if (confirm(t('subject.deleteWarn'))) onDelete(id)
  }

  return (
    <div className="panel">
      <form className="form card-surface" onSubmit={handleAdd}>
        <div className="field-row">
          <label className="field">
            <span className="field__label">{t('subject.name')}</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('subject.namePlaceholder')}
            />
          </label>
          <label className="field field--narrow">
            <span className="field__label">{t('subject.code')}</span>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('subject.codePlaceholder')}
            />
          </label>
        </div>

        <span className="field__label">{t('subject.color')}</span>
        <div className="swatches">
          {SUBJECT_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={`swatch ${c === color ? 'swatch--on' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
            {t('action.addSubject')}
          </button>
        </div>
      </form>

      <div className="subject-list">
        {subjects.length === 0 ? (
          <p className="muted">{t('subject.empty')}</p>
        ) : (
          subjects.map((s) => (
            <div className="subject-row" key={s.id}>
              <span className="dot" style={{ background: s.color }} />
              <span className="subject-row__name">
                {s.name}
                {s.code ? <span className="muted"> · {s.code}</span> : null}
              </span>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => handleDelete(s.id)}
                aria-label={t('action.delete')}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
