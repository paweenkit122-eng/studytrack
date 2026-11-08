import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from './jwt'

const SECRET = 'test-secret'

describe('jwt', () => {
  it('round-trips the payload', () => {
    const token = signToken({ userId: 'user-1' }, SECRET, '1h')
    expect(verifyToken(token, SECRET)).toEqual({ userId: 'user-1' })
  })

  it('rejects a token signed with a different secret', () => {
    const token = signToken({ userId: 'user-1' }, SECRET, '1h')
    expect(() => verifyToken(token, 'other-secret')).toThrow()
  })

  it('rejects an expired token', () => {
    const token = signToken({ userId: 'user-1' }, SECRET, '-1s') // already expired
    expect(() => verifyToken(token, SECRET)).toThrow()
  })

  it('rejects a tampered token', () => {
    const token = signToken({ userId: 'user-1' }, SECRET, '1h')
    expect(() => verifyToken(token + 'x', SECRET)).toThrow()
  })
})
