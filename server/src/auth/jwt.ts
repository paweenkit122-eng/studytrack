import jwt, { type SignOptions } from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
}

/**
 * Sign a JWT. The secret and expiry are passed in (not read from the
 * environment) so this stays a pure, easily unit-tested function.
 */
export function signToken(
  payload: TokenPayload,
  secret: string,
  expiresIn: string | number = '7d',
): string {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions)
}

/** Verify a JWT and return its payload, throwing if invalid or expired. */
export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret)
  if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
    throw new Error('Malformed token payload')
  }
  return { userId: decoded.userId }
}
