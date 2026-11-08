import { useLanguage } from '../context/LanguageContext'
import type { SyncStatus } from '../hooks/useStudyData'

/**
 * The account area in the sidebar footer: a sign-in button when logged out,
 * or the current user + sync status + log-out when logged in.
 */
export function AccountPanel({
  email,
  status,
  onSignIn,
  onLogout,
  onRetry,
}: {
  email: string | null
  status: SyncStatus
  onSignIn: () => void
  onLogout: () => void
  onRetry: () => void
}) {
  const { t } = useLanguage()

  if (!email) {
    return (
      <div className="account">
        <button className="btn btn--primary btn--sm account__cta" onClick={onSignIn}>
          ☁︎ {t('auth.signInToSync')}
        </button>
        <p className="footer__note">{t('auth.localMode')}</p>
      </div>
    )
  }

  return (
    <div className="account">
      <div className="account__row">
        <span className="account__email" title={email}>
          {email}
        </span>
        <button className="linkbtn" onClick={onLogout}>
          {t('auth.logout')}
        </button>
      </div>
      <p className="footer__note">
        {status === 'loading' && `☁︎ ${t('auth.syncing')}`}
        {status === 'cloud' && `✓ ${t('auth.synced')}`}
        {status === 'error' && (
          <>
            ⚠︎ {t('auth.cloudError')} ·{' '}
            <button className="linkbtn" onClick={onRetry}>
              {t('auth.retry')}
            </button>
          </>
        )}
        {status === 'local' && t('auth.localMode')}
      </p>
    </div>
  )
}
