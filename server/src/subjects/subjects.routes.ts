import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma'
import { AppError, asyncHandler } from '../lib/errors'
import { validate } from '../lib/validate'
import { requireAuth } from '../auth/middleware'

const subjectCreate = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  color: z.string().min(1),
})
const subjectUpdate = subjectCreate.partial()

export const subjectRoutes = Router()
subjectRoutes.use(requireAuth) // every route below requires a valid token

/** Throw 404 unless the subject exists AND belongs to this user. */
async function assertOwned(userId: string, id: string) {
  const found = await prisma.subject.findFirst({ where: { id, userId } })
  if (!found) throw new AppError(404, 'Subject not found')
}

subjectRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    })
    res.json(subjects)
  }),
)

subjectRoutes.post(
  '/',
  validate(subjectCreate),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof subjectCreate>
    const subject = await prisma.subject.create({ data: { ...data, userId: req.userId! } })
    res.status(201).json(subject)
  }),
)

subjectRoutes.patch(
  '/:id',
  validate(subjectUpdate),
  asyncHandler(async (req, res) => {
    await assertOwned(req.userId!, req.params.id)
    const subject = await prisma.subject.update({ where: { id: req.params.id }, data: req.body })
    res.json(subject)
  }),
)

subjectRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await assertOwned(req.userId!, req.params.id)
    await prisma.subject.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)
