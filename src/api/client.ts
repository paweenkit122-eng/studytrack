import type { AppData, EventType, Difficulty, StudyEvent, Subject } from '../types'

// Where the backend lives. Set VITE_API_URL at build time for production.
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:4000'

/** An HTTP error from the API, carrying the status code and server message. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// The current bearer token (set by the auth layer). Module-level so every
// request picks it up without threading it through each call.
let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

// Called when any request comes back 401 (e.g. an expired token) so the app
// can drop the session.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 401) onUnauthorized?.()

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      // response had no JSON body — keep the status text
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export interface AuthResult {
  token: string
  user: { id: string; email: string }
}

export interface NewSubjectInput {
  name: string
  code?: string
  color: string
}

export interface NewEventInput {
  title: string
  type: EventType
  date: string
  subjectId?: string | null
  time?: string
  note?: string
  done?: boolean
  chapters?: number
  difficulty?: Difficulty
  chaptersDone?: number
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getData: () => request<AppData>('/api/data'),

  createSubject: (input: NewSubjectInput) =>
    request<Subject>('/api/subjects', { method: 'POST', body: JSON.stringify(input) }),
  deleteSubject: (id: string) =>
    request<void>(`/api/subjects/${id}`, { method: 'DELETE' }),

  createEvent: (input: NewEventInput) =>
    request<StudyEvent>('/api/events', { method: 'POST', body: JSON.stringify(input) }),
  updateEvent: (id: string, patch: Partial<NewEventInput>) =>
    request<StudyEvent>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteEvent: (id: string) => request<void>(`/api/events/${id}`, { method: 'DELETE' }),
}
