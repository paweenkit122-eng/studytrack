import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from './client'

/** Build a minimal fake Response for the mocked fetch. */
function fakeResponse(body: unknown, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    statusText: 'STATUS',
    json: async () => body,
  } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  setAuthToken(null)
  setUnauthorizedHandler(() => {})
})

describe('api client', () => {
  it('sends the bearer token when set', async () => {
    setAuthToken('abc123')
    fetchMock.mockResolvedValue(fakeResponse({ subjects: [], events: [] }))
    await api.getData()
    const [, options] = fetchMock.mock.calls[0]
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer abc123')
  })

  it('omits the Authorization header when logged out', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ subjects: [], events: [] }))
    await api.getData()
    const [, options] = fetchMock.mock.calls[0]
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('parses and returns the JSON body on success', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ token: 't', user: { id: '1', email: 'a@b.c' } }))
    const res = await api.login('a@b.c', 'secret123')
    expect(res.token).toBe('t')
    expect(res.user.email).toBe('a@b.c')
  })

  it('throws ApiError with the server message on failure', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ error: 'Invalid email or password' }, { ok: false, status: 401 }))
    await expect(api.login('a@b.c', 'nope123')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    })
  })

  it('calls the unauthorized handler on 401', async () => {
    const onUnauth = vi.fn()
    setUnauthorizedHandler(onUnauth)
    fetchMock.mockResolvedValue(fakeResponse({ error: 'nope' }, { ok: false, status: 401 }))
    await expect(api.getData()).rejects.toBeInstanceOf(ApiError)
    expect(onUnauth).toHaveBeenCalledTimes(1)
  })

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response)
    await expect(api.deleteEvent('x')).resolves.toBeUndefined()
  })
})
