import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../hooks/useTheme'

/** Top bar: menu toggle + current view title on the left; quick actions on the right. */
export function Header({
  title,
  onMenuToggle,
  onAddEvent,
}: {
  title: string
  onMenuToggle: () => void
  onAddEvent: () => void
}) {
  const { t, toggle: toggleLang } = useLanguage()
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="icon-btn topbar__menu"
          onClick={onMenuToggle}
          aria-label={t('sidebar.toggle')}
          title={t('sidebar.toggle')}
        >
          ☰
        </button>
        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__actions">
        <button className="btn btn--primary btn--sm" onClick={onAddEvent}>
          {t('action.addEvent')}
        </button>
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
          title={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="pill-btn" onClick={toggleLang} aria-label="Switch language">
          {t('lang.toggle')}
        </button>
      </div>
    </header>
  )
}
