import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { api, ApiError, setAuthToken, setUnauthorizedHandler, type AuthResult } from '../api/client'

export interface AuthUser {
  id: string
  email: string
}

/**
 * Authentication state: the JWT + current user, persisted to localStorage so
 * the session survives reloads. Keeps the API client's token in sync and logs
 * out automatically if the server ever rejects the token (401).
 */
export function useAuth() {
  const [token, setToken] = useLocalStorage<string | null>('studytrack.token', null)
  const [user, setUser] = useLocalStorage<AuthUser | null>('studytrack.user', null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Push the token into the API client BEFORE data-loading effects run.
  useLayoutEffect(() => {
    setAuthToken(token)
  }, [token])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setError(null)
  }, [setToken, setUser])

  // Register a stable 401 handler once.
  const logoutRef = useRef(logout)
  logoutRef.current = logout
  useLayoutEffect(() => {
    setUnauthorizedHandler(() => logoutRef.current())
  }, [])

  const run = useCallback(
    async (fn: () => Promise<AuthResult>) => {
      setBusy(true)
      setError(null)
      try {
        const res = await fn()
        setToken(res.token)
        setUser(res.user)
        return true
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Network error — is the API running?')
        return false
      } finally {
        setBusy(false)
      }
    },
    [setToken, setUser],
  )

  const login = useCallback((email: string, password: string) => run(() => api.login(email, password)), [run])
  const register = useCallback(
    (email: string, password: string) => run(() => api.register(email, password)),
    [run],
  )

  return { token, user, error, busy, login, register, logout, clearError: () => setError(null) }
}
