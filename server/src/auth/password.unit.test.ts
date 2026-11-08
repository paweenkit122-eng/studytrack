import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('produces a hash different from the plaintext', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).not.toBe('secret123')
    expect(hash.length).toBeGreaterThan(20)
  })

  it('verifies the correct password', async () => {
    const hash = await hashPassword('secret123')
    expect(await verifyPassword('secret123', hash)).toBe(true)
  })

  it('rejects the wrong password', async () => {
    const hash = await hashPassword('secret123')
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })

  it('salts — the same password hashes differently each time', async () => {
    const a = await hashPassword('secret123')
    const b = await hashPassword('secret123')
    expect(a).not.toBe(b)
  })
})
