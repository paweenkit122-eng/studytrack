import type { ReactNode } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { DataMenu } from './DataMenu'
import type { TranslationKey } from '../i18n/translations'
import type { AppData } from '../types'

/** Every tab the sidebar can show. The type tabs reuse the agenda list, filtered. */
export type View =
  | 'all'
  | 'exam'
  | 'quiz'
  | 'homework'
  | 'other'
  | 'calendar'
  | 'planner'
  | 'subjects'

/** Counts shown as badges on each tab (pending items, or subject total). */
export type NavCounts = Record<'all' | 'exam' | 'quiz' | 'homework' | 'other' | 'subjects', number>

type NavItem = { id: View; icon: string; key: TranslationKey; count?: keyof NavCounts }

const GROUPS: { label?: TranslationKey; items: NavItem[] }[] = [
  {
    label: 'sidebar.overview',
    items: [
      { id: 'all', icon: '📋', key: 'nav.all', count: 'all' },
      { id: 'calendar', icon: '📅', key: 'nav.calendar' },
      { id: 'planner', icon: '🧠', key: 'nav.planner' },
    ],
  },
  {
    label: 'sidebar.types',
    items: [
      { id: 'exam', icon: '📝', key: 'type.exam', count: 'exam' },
      { id: 'quiz', icon: '✏️', key: 'type.quiz', count: 'quiz' },
      { id: 'homework', icon: '📚', key: 'type.homework', count: 'homework' },
      { id: 'other', icon: '📌', key: 'type.other', count: 'other' },
    ],
  },
  {
    items: [{ id: 'subjects', icon: '🗂️', key: 'nav.subjects', count: 'subjects' }],
  },
]

export function Sidebar({
  view,
  onView,
  counts,
  collapsed,
  onToggleCollapse,
  open,
  onClose,
  data,
  onImport,
  account,
}: {
  view: View
  onView: (view: View) => void
  counts: NavCounts
  collapsed: boolean
  onToggleCollapse: () => void
  open: boolean
  onClose: () => void
  data: AppData
  onImport: (data: AppData) => void
  account?: ReactNode
}) {
  const { t } = useLanguage()

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${open ? 'sidebar--open' : ''}`}
      aria-label={t('sidebar.menu')}
    >
      <div className="sidebar__head">
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            🎓
          </span>
          <span className="sidebar__brand-text">{t('app.title')}</span>
        </div>

        <button
          className="icon-btn sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? '»' : '«'}
        </button>

        <button className="icon-btn sidebar__close" onClick={onClose} aria-label={t('action.close')}>
          ✕
        </button>
      </div>

      <nav className="sidebar__nav">
        {GROUPS.map((group, gi) => (
          <div className="nav-group" key={group.label ?? `g${gi}`}>
            {group.label && <span className="nav-group__label">{t(group.label)}</span>}
            {group.items.map((item) => {
              const badge = item.count ? counts[item.count] : 0
              return (
                <button
                  key={item.id}
                  className={`nav-item ${view === item.id ? 'nav-item--on' : ''}`}
                  onClick={() => onView(item.id)}
                  aria-current={view === item.id ? 'page' : undefined}
                  title={t(item.key)}
                >
                  <span className="nav-item__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="nav-item__label">{t(item.key)}</span>
                  {badge > 0 && <span className="nav-item__badge">{badge}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        {account}
        <DataMenu data={data} onImport={onImport} />
        <p className="footer__note">{t('footer.offline')}</p>
      </div>
    </aside>
  )
}
