import type { NextFunction, Request, Response } from 'express'
import { env } from '../env'
import { AppError } from '../lib/errors'
import { verifyToken } from './jwt'

/**
 * Gate for protected routes. Expects an `Authorization: Bearer <token>`
 * header, verifies the JWT, and attaches the user id to the request.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid Authorization header')
  }
  try {
    const { userId } = verifyToken(header.slice('Bearer '.length), env.JWT_SECRET)
    req.userId = userId
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}
