import { Router } from 'express'
import { z } from 'zod'
import { env } from '../env'
import { prisma } from '../prisma'
import { AppError, asyncHandler } from '../lib/errors'
import { validate } from '../lib/validate'
import { hashPassword, verifyPassword } from './password'
import { signToken } from './jwt'
import { requireAuth } from './middleware'

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authRoutes = Router()

// POST /api/auth/register — create an account.
authRoutes.post(
  '/register',
  validate(credentials),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof credentials>
    const hashed = await hashPassword(password)
    // A duplicate email throws Prisma P2002 → handled as 409 by errorHandler.
    const user = await prisma.user.create({
      data: { email, password: hashed },
      select: { id: true, email: true },
    })
    const token = signToken({ userId: user.id }, env.JWT_SECRET, env.JWT_EXPIRES_IN)
    res.status(201).json({ token, user })
  }),
)

// POST /api/auth/login — exchange credentials for a token.
authRoutes.post(
  '/login',
  validate(credentials),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof credentials>
    const user = await prisma.user.findUnique({ where: { email } })
    // Same error whether the email or the password is wrong (no account enumeration).
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new AppError(401, 'Invalid email or password')
    }
    const token = signToken({ userId: user.id }, env.JWT_SECRET, env.JWT_EXPIRES_IN)
    res.json({ token, user: { id: user.id, email: user.email } })
  }),
)

// GET /api/auth/me — the current user.
authRoutes.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    res.json({ user })
  }),
)
