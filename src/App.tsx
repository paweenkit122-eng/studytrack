import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Sidebar, type View, type NavCounts } from './components/Sidebar'
import { CountdownHero } from './components/CountdownHero'
import { EventList } from './components/EventList'
import { EventForm } from './components/EventForm'
import { SubjectsView } from './components/SubjectsView'
import { Calendar } from './components/Calendar'
import { Planner } from './components/Planner'
import { AuthModal } from './components/AuthModal'
import { AccountPanel } from './components/AccountPanel'
import { useLanguage } from './context/LanguageContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAuth } from './hooks/useAuth'
import { useStudyData } from './hooks/useStudyData'
import { useReminders, notificationsSupported } from './hooks/useReminders'
import { daysUntil } from './lib/dates'
import type { EventType, StudyEvent, Subject } from './types'
import type { TranslationKey } from './i18n/translations'

const isDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 861px)').matches

const TYPE_VIEWS: View[] = ['all', 'exam', 'quiz', 'homework', 'other']

const VIEW_TITLE: Record<View, TranslationKey> = {
  all: 'nav.all',
  exam: 'type.exam',
  quiz: 'type.quiz',
  homework: 'type.homework',
  other: 'type.other',
  calendar: 'nav.calendar',
  planner: 'nav.planner',
  subjects: 'nav.subjects',
}

export default function App() {
  const { t } = useLanguage()
  const auth = useAuth()
  const study = useStudyData(auth.token)
  const { subjects, events } = study.data

  const [view, setView] = useLocalStorage<View>('studytrack.view2', 'all')
  const [collapsed, setCollapsed] = useLocalStorage('studytrack.collapsed', false)
  const [capacity, setCapacity] = useLocalStorage('studytrack.capacity', 4)
  const [remindersEnabled, setRemindersEnabled] = useLocalStorage('studytrack.reminders', false)
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop)

  // Fire browser notifications for upcoming exams when enabled.
  useReminders(events, remindersEnabled)

  const [showDone, setShowDone] = useState(false)
  const [editing, setEditing] = useState<StudyEvent | 'new' | null>(null)
  const [addDate, setAddDate] = useState<string | undefined>(undefined)
  const [authOpen, setAuthOpen] = useState(false)

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])) as Record<string, Subject>,
    [subjects],
  )

  const counts = useMemo<NavCounts>(() => {
    const c: NavCounts = { all: 0, exam: 0, quiz: 0, homework: 0, other: 0, subjects: subjects.length }
    for (const e of events) {
      if (!e.done) {
        c.all++
        c[e.type]++
      }
    }
    return c
  }, [events, subjects.length])

  const isAgenda = TYPE_VIEWS.includes(view)
  const { overdue, upcoming, done, hero, matchCount } = useMemo(() => {
    const byType = view === 'all' ? events : events.filter((e) => e.type === (view as EventType))
    const pending = byType.filter((e) => !e.done).sort((a, b) => a.date.localeCompare(b.date))
    return {
      matchCount: byType.length,
      overdue: pending.filter((e) => daysUntil(e.date) < 0),
      upcoming: pending.filter((e) => daysUntil(e.date) >= 0),
      done: showDone
        ? byType.filter((e) => e.done).sort((a, b) => b.date.localeCompare(a.date))
        : [],
      hero: pending[0],
    }
  }, [events, view, showDone])

  // Confirm before destructive event deletes (subject deletes confirm in-view).
  const confirmDeleteEvent = (id: string) => {
    if (confirm(t('confirm.deleteEvent'))) void study.deleteEvent(id)
  }

  const openAdd = (date?: string) => {
    setAddDate(date)
    setEditing('new')
  }
  const openEdit = (event: StudyEvent) => {
    setAddDate(undefined)
    setEditing(event)
  }

  const chooseView = (v: View) => {
    setView(v)
    if (!isDesktop()) setSidebarOpen(false)
  }

  const toggleReminders = async () => {
    if (!notificationsSupported()) return
    if (remindersEnabled) {
      setRemindersEnabled(false)
      return
    }
    if (Notification.permission === 'denied') {
      alert(t('reminder.denied'))
      return
    }
    if (Notification.permission === 'granted') {
      setRemindersEnabled(true)
      return
    }
    const res = await Notification.requestPermission()
    if (res === 'granted') setRemindersEnabled(true)
    else if (res === 'denied') alert(t('reminder.denied'))
  }

  const loading = study.status === 'loading'

  return (
    <div className="layout">
      <Sidebar
        view={view}
        onView={chooseView}
        counts={counts}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        data={study.data}
        onImport={study.importData}
        account={
          <AccountPanel
            email={auth.user?.email ?? null}
            status={study.status}
            onSignIn={() => setAuthOpen(true)}
            onLogout={auth.logout}
            onRetry={study.refresh}
          />
        }
      />

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} role="presentation" />
      )}

      <div className="main">
        <Header
          title={t(VIEW_TITLE[view])}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onAddEvent={() => openAdd()}
        />

        <main className="container">
          {study.status === 'error' && (
            <div className="sync-banner">
              <span>⚠︎ {t('auth.cloudError')}</span>
              <button className="linkbtn" onClick={study.refresh}>
                {t('auth.retry')}
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <span className="spinner" aria-hidden="true" />
              {t('auth.syncing')}
            </div>
          ) : (
            <>
              {isAgenda &&
                (events.length === 0 ? (
                  <div className="empty">
                    <div className="empty__icon">🗓️</div>
                    <h2>{t('empty.title')}</h2>
                    <p>{t('empty.text')}</p>
                    <button className="btn btn--primary" onClick={() => openAdd()}>
                      {t('action.addEvent')}
                    </button>
                  </div>
                ) : matchCount === 0 ? (
                  <div className="empty">
                    <div className="empty__icon">📭</div>
                    <h2>{t('empty.typeNone')}</h2>
                    <button className="btn btn--primary" onClick={() => openAdd()}>
                      {t('action.addEvent')}
                    </button>
                  </div>
                ) : (
                  <>
                    <CountdownHero
                      event={hero}
                      subject={hero?.subjectId ? subjectById[hero.subjectId] : undefined}
                    />
                    <div className="agenda-tools">
                      {notificationsSupported() && (
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={toggleReminders}
                          aria-pressed={remindersEnabled}
                        >
                          {remindersEnabled ? '🔔' : '🔕'} {t('reminder.label')}
                        </button>
                      )}
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={showDone}
                          onChange={(e) => setShowDone(e.target.checked)}
                        />
                        <span>{t('filter.showDone')}</span>
                      </label>
                    </div>
                    <EventList
                      title={t('section.overdue')}
                      events={overdue}
                      subjectById={subjectById}
                      onToggleDone={study.toggleDone}
                      onEdit={openEdit}
                      onDelete={confirmDeleteEvent}
                    />
                    <EventList
                      title={t('section.upcoming')}
                      events={upcoming}
                      subjectById={subjectById}
                      onToggleDone={study.toggleDone}
                      onEdit={openEdit}
                      onDelete={confirmDeleteEvent}
                    />
                    <EventList
                      title={t('section.done')}
                      events={done}
                      subjectById={subjectById}
                      onToggleDone={study.toggleDone}
                      onEdit={openEdit}
                      onDelete={confirmDeleteEvent}
                    />
                  </>
                ))}

              {view === 'calendar' && (
                <Calendar
                  events={events}
                  subjectById={subjectById}
                  onEdit={openEdit}
                  onDelete={confirmDeleteEvent}
                  onToggleDone={study.toggleDone}
                  onAddOnDate={openAdd}
                />
              )}

              {view === 'planner' && (
                <Planner
                  events={events}
                  subjectById={subjectById}
                  capacity={capacity}
                  onCapacityChange={setCapacity}
                />
              )}

              {view === 'subjects' && (
                <SubjectsView
                  subjects={subjects}
                  onAdd={study.addSubject}
                  onDelete={study.deleteSubject}
                />
              )}
            </>
          )}
        </main>
      </div>

      {editing && (
        <EventForm
          initial={editing === 'new' ? undefined : editing}
          defaultDate={editing === 'new' ? addDate : undefined}
          subjects={subjects}
          onSave={study.upsertEvent}
          onClose={() => setEditing(null)}
        />
      )}

      {authOpen && (
        <AuthModal
          busy={auth.busy}
          error={auth.error}
          onLogin={auth.login}
          onRegister={auth.register}
          onClose={() => setAuthOpen(false)}
          clearError={auth.clearError}
        />
      )}
    </div>
  )
}
