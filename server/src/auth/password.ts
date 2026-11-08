import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/** Hash a plaintext password for storage. Never store the plaintext. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/** Check a plaintext password against a stored bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
