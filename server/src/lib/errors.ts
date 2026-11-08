import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'

/** An error with an HTTP status we intend to return to the client. */
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Wrap an async route handler so rejected promises reach the error handler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

/** Central error handler — the last middleware. Maps errors to clean JSON. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message })
  }

  // Translate common Prisma errors into friendly HTTP responses.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already exists' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' })
  }

  console.error('Unhandled error:', err)
  return res.status(500).json({ error: 'Internal server error' })
}
