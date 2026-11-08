import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

/**
 * Middleware factory: validate `req.body` against a Zod schema.
 * On success the parsed (and typed/coerced) data replaces req.body.
 * On failure it returns 400 with per-field messages — and never lets
 * unvalidated input reach the database.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      })
      return
    }
    req.body = result.data
    next()
  }
}
