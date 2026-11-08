import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import type { PrismaClient } from '@prisma/client'

// These tests need a real database. They run in CI (and locally when you
// provide DATABASE_URL) and are skipped otherwise, so `npm run test` is always
// safe to run without a database.
const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('API integration', () => {
  let app: Express
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.JWT_SECRET ||= 'test-secret'
    // Import after env is set so env validation passes.
    prisma = (await import('./prisma')).prisma
    app = (await import('./app')).createApp()
    await prisma.event.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma?.$disconnect()
  })

  const email = `user${Date.now()}@example.com`
  const password = 'secret123'
  let token = ''
  let subjectId = ''

  it('registers a new user and never returns the password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(email)
    expect(res.body.user.password).toBeUndefined()
    token = res.body.token
  })

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password })
    expect(res.status).toBe(409)
  })

  it('rejects a weak password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'weak@example.com', password: '123' })
    expect(res.status).toBe(400)
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('rejects a wrong password with 401', async () => {
    // Valid length (passes validation) but incorrect → reaches auth logic.
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrongpassword' })
    expect(res.status).toBe(401)
  })

  it('blocks protected routes without a token', async () => {
    expect((await request(app).get('/api/subjects')).status).toBe(401)
  })

  it('creates and lists a subject', async () => {
    const create = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Data Structures', code: 'CPE231', color: '#4f46e5' })
    expect(create.status).toBe(201)
    subjectId = create.body.id
    const list = await request(app).get('/api/subjects').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body).toHaveLength(1)
  })

  it('validates event input', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', type: 'exam', date: 'not-a-date' })
    expect(res.status).toBe(400)
  })

  it('creates an event linked to the subject', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Midterm', type: 'exam', date: '2026-12-01', subjectId })
    expect(res.status).toBe(201)
    expect(res.body.subjectId).toBe(subjectId)
  })

  it('returns combined data for the user', async () => {
    const res = await request(app).get('/api/data').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.subjects).toHaveLength(1)
    expect(res.body.events).toHaveLength(1)
  })

  it('isolates one user’s data from another', async () => {
    const other = await request(app)
      .post('/api/auth/register')
      .send({ email: `other${Date.now()}@example.com`, password })
    const list = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${other.body.token}`)
    expect(list.body).toHaveLength(0)
  })
})
