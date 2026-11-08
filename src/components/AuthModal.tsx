import { useState, type FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Modal } from './Modal'

export function AuthModal({
  busy,
  error,
  onLogin,
  onRegister,
  onClose,
  clearError,
}: {
  busy: boolean
  error: string | null
  onLogin: (email: string, password: string) => Promise<boolean>
  onRegister: (email: string, password: string) => Promise<boolean>
  onClose: () => void
  clearError: () => void
}) {
  const { t } = useLanguage()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const ok = mode === 'login' ? await onLogin(email, password) : await onRegister(email, password)
    if (ok) onClose()
  }

  return (
    <Modal title={mode === 'login' ? t('auth.signIn') : t('auth.signUp')} onClose={onClose}>
      <p className="muted auth__subtitle">{t('auth.subtitle')}</p>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">{t('auth.email')}</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
            }}
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span className="field__label">{t('auth.password')}</span>
          <input
            className="input"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
            minLength={6}
            required
          />
          <span className="field__hint">{t('auth.passwordHint')}</span>
        </label>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions form__actions--split">
          <button
            type="button"
            className="linkbtn"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'))
              clearError()
            }}
          >
            {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? '…' : mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
