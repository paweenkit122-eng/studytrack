import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { api, ApiError, type NewEventInput } from '../api/client'
import { seedData } from '../lib/seed'
import type { AppData, StudyEvent, Subject } from '../types'

const INITIAL_DATA = seedData()
const EMPTY: AppData = { subjects: [], events: [] }

export type SyncStatus = 'local' | 'loading' | 'cloud' | 'error'

/** Pick only the writable fields of an event for the API. */
function eventPayload(e: StudyEvent): NewEventInput {
  return {
    title: e.title,
    type: e.type,
    date: e.date,
    subjectId: e.subjectId,
    time: e.time,
    note: e.note,
    done: e.done,
    chapters: e.chapters,
    difficulty: e.difficulty,
    chaptersDone: e.chaptersDone,
  }
}

/** Upload a whole dataset to the server, remapping subject ids → new ids. */
async function pushData(d: AppData) {
  const idMap = new Map<string, string>()
  for (const s of d.subjects) {
    const saved = await api.createSubject({ name: s.name, code: s.code, color: s.color })
    idMap.set(s.id, saved.id)
  }
  for (const e of d.events) {
    await api.createEvent({
      ...eventPayload(e),
      subjectId: e.subjectId ? (idMap.get(e.subjectId) ?? null) : null,
    })
  }
}

/**
 * The app's data layer. Works in two modes:
 *   - logged out → `local`: everything in localStorage (offline-first).
 *   - logged in  → `cloud`: everything via the REST API, so it syncs across
 *     devices. On the first login it uploads any existing local data.
 * Both modes expose the same mutation interface, so the UI doesn't care.
 */
export function useStudyData(token: string | null) {
  const [local, setLocal] = useLocalStorage<AppData>('studytrack.data', INITIAL_DATA)
  const [cloud, setCloud] = useState<AppData | null>(null)
  const [status, setStatus] = useState<SyncStatus>(token ? 'loading' : 'local')
  const [error, setError] = useState<string | null>(null)

  const isCloud = !!token
  const data = isCloud ? (cloud ?? EMPTY) : local

  // Always read the freshest local data inside async callbacks.
  const localRef = useRef(local)
  localRef.current = local

  const fail = useCallback((e: unknown) => {
    setError(e instanceof ApiError ? e.message : 'Network error')
  }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    setStatus('loading')
    setError(null)
    try {
      setCloud(await api.getData())
      setStatus('cloud')
    } catch (e) {
      fail(e)
      setStatus('error')
    }
  }, [token, fail])

  // Load (and, on first login, migrate) cloud data when the token changes.
  useEffect(() => {
    if (!token) {
      setCloud(null)
      setStatus('local')
      setError(null)
      return
    }
    let cancelled = false
    setStatus('loading')
    setError(null)
    ;(async () => {
      try {
        let server = await api.getData()
        const l = localRef.current
        const serverEmpty = server.subjects.length === 0 && server.events.length === 0
        const localHasData = l.subjects.length > 0 || l.events.length > 0
        if (serverEmpty && localHasData) {
          await pushData(l) // one-time migration of offline data to the cloud
          server = await api.getData()
        }
        if (!cancelled) {
          setCloud(server)
          setStatus('cloud')
        }
      } catch (e) {
        if (!cancelled) {
          fail(e)
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, fail])

  // ---- Mutations: in local mode mutate localStorage; in cloud mode call the
  // API then reflect the server's response in state. ----

  const addSubject = useCallback(
    async (subject: Subject) => {
      if (!isCloud) {
        setLocal((d) => ({ ...d, subjects: [...d.subjects, subject] }))
        return
      }
      try {
        const saved = await api.createSubject({
          name: subject.name,
          code: subject.code,
          color: subject.color,
        })
        setCloud((d) => ({ ...(d ?? EMPTY), subjects: [...(d?.subjects ?? []), saved] }))
      } catch (e) {
        fail(e)
      }
    },
    [isCloud, setLocal, fail],
  )

  const deleteSubject = useCallback(
    async (id: string) => {
      const detach = (d: AppData): AppData => ({
        subjects: d.subjects.filter((s) => s.id !== id),
        events: d.events.map((e) => (e.subjectId === id ? { ...e, subjectId: null } : e)),
      })
      if (!isCloud) {
        setLocal(detach)
        return
      }
      try {
        await api.deleteSubject(id)
        setCloud((d) => detach(d ?? EMPTY))
      } catch (e) {
        fail(e)
      }
    },
    [isCloud, setLocal, fail],
  )

  const upsertEvent = useCallback(
    async (event: StudyEvent) => {
      if (!isCloud) {
        setLocal((d) => {
          const exists = d.events.some((e) => e.id === event.id)
          return {
            ...d,
            events: exists
              ? d.events.map((e) => (e.id === event.id ? event : e))
              : [...d.events, event],
          }
        })
        return
      }
      try {
        const exists = (cloud?.events ?? []).some((e) => e.id === event.id)
        if (exists) {
          const saved = await api.updateEvent(event.id, eventPayload(event))
          setCloud((d) => ({
            ...(d ?? EMPTY),
            events: (d?.events ?? []).map((e) => (e.id === saved.id ? saved : e)),
          }))
        } else {
          const saved = await api.createEvent(eventPayload(event))
          setCloud((d) => ({ ...(d ?? EMPTY), events: [...(d?.events ?? []), saved] }))
        }
      } catch (e) {
        fail(e)
      }
    },
    [isCloud, cloud, setLocal, fail],
  )

  const toggleDone = useCallback(
    async (id: string) => {
      if (!isCloud) {
        setLocal((d) => ({
          ...d,
          events: d.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
        }))
        return
      }
      const current = cloud?.events.find((e) => e.id === id)
      if (!current) return
      // Optimistic flip for a snappy checkbox; revert via refresh on failure.
      setCloud((d) => ({
        ...(d ?? EMPTY),
        events: (d?.events ?? []).map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
      }))
      try {
        await api.updateEvent(id, { done: !current.done })
      } catch (e) {
        fail(e)
        refresh()
      }
    },
    [isCloud, cloud, setLocal, fail, refresh],
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!isCloud) {
        setLocal((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }))
        return
      }
      try {
        await api.deleteEvent(id)
        setCloud((d) => ({ ...(d ?? EMPTY), events: (d?.events ?? []).filter((e) => e.id !== id) }))
      } catch (e) {
        fail(e)
      }
    },
    [isCloud, setLocal, fail],
  )

  const importData = useCallback(
    async (incoming: AppData) => {
      if (!isCloud) {
        setLocal(incoming)
        return
      }
      // In cloud mode, add the imported items to the account, then re-sync.
      try {
        setStatus('loading')
        await pushData(incoming)
        await refresh()
      } catch (e) {
        fail(e)
        setStatus('error')
      }
    },
    [isCloud, setLocal, refresh, fail],
  )

  return {
    data,
    status,
    error,
    clearError: () => setError(null),
    refresh,
    addSubject,
    deleteSubject,
    upsertEvent,
    toggleDone,
    deleteEvent,
    importData,
  }
}
