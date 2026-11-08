import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './env'
import { prisma } from './prisma'
import { asyncHandler, errorHandler } from './lib/errors'
import { authRoutes } from './auth/auth.routes'
import { requireAuth } from './auth/middleware'
import { subjectRoutes } from './subjects/subjects.routes'
import { eventRoutes } from './events/events.routes'

/**
 * Build the Express app. Exported (rather than started here) so tests can
 * drive it with supertest without opening a real port.
 */
export function createApp() {
  const app = express()

  // Security & parsing middleware.
  app.use(helmet()) // sensible secure HTTP headers
  app.use(cors({ origin: env.CORS_ORIGIN })) // only allow our frontend's origin
  app.use(express.json({ limit: '1mb' })) // parse JSON, cap body size

  // Throttle auth endpoints to blunt brute-force / credential-stuffing attacks.
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 })

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authLimiter, authRoutes)
  app.use('/api/subjects', subjectRoutes)
  app.use('/api/events', eventRoutes)

  // Convenience endpoint for the frontend: fetch all of a user's data at once.
  app.get(
    '/api/data',
    requireAuth,
    asyncHandler(async (req, res) => {
      const [subjects, events] = await Promise.all([
        prisma.subject.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
        prisma.event.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
      ])
      res.json({ subjects, events })
    }),
  )

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
  app.use(errorHandler)

  return app
}
