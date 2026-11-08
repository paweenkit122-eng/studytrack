import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma'
import { AppError, asyncHandler } from '../lib/errors'
import { validate } from '../lib/validate'
import { requireAuth } from '../auth/middleware'

const eventCreate = z.object({
  title: z.string().min(1),
  type: z.enum(['exam', 'quiz', 'homework', 'other']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  subjectId: z.string().nullable().optional(),
  time: z.string().optional(),
  note: z.string().optional(),
  done: z.boolean().optional(),
  chapters: z.number().int().min(0).optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
  chaptersDone: z.number().int().min(0).optional(),
})
const eventUpdate = eventCreate.partial()

export const eventRoutes = Router()
eventRoutes.use(requireAuth)

async function assertOwned(userId: string, id: string) {
  const found = await prisma.event.findFirst({ where: { id, userId } })
  if (!found) throw new AppError(404, 'Event not found')
}

/** If a subjectId is supplied, it must be one of this user's own subjects. */
async function assertSubject(userId: string, subjectId: string | null | undefined) {
  if (!subjectId) return
  const found = await prisma.subject.findFirst({ where: { id: subjectId, userId } })
  if (!found) throw new AppError(400, 'Unknown subject')
}

eventRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const events = await prisma.event.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    })
    res.json(events)
  }),
)

eventRoutes.post(
  '/',
  validate(eventCreate),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof eventCreate>
    await assertSubject(req.userId!, data.subjectId)
    const event = await prisma.event.create({ data: { ...data, userId: req.userId! } })
    res.status(201).json(event)
  }),
)

eventRoutes.patch(
  '/:id',
  validate(eventUpdate),
  asyncHandler(async (req, res) => {
    await assertOwned(req.userId!, req.params.id)
    const data = req.body as z.infer<typeof eventUpdate>
    if ('subjectId' in data) await assertSubject(req.userId!, data.subjectId)
    const event = await prisma.event.update({ where: { id: req.params.id }, data })
    res.json(event)
  }),
)

eventRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await assertOwned(req.userId!, req.params.id)
    await prisma.event.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)
