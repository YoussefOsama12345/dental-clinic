import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../../../src/app'
import { authHeader } from '../helpers/auth'
import { closeDb, truncateAll } from '../helpers/db'
import { seedDentist } from '../helpers/fixtures'

let app: Express
const auth = authHeader()

beforeAll(() => {
  app = createApp()
})
beforeEach(() => truncateAll())
afterAll(() => closeDb())

describe('POST /api/dentists', () => {
  it('creates a dentist with sensible defaults', async () => {
    const res = await request(app)
      .post('/api/dentists')
      .set(auth)
      .send({ fullName: 'Dr. Sarah', qualifications: ['BDS'], workingDays: ['mon', 'tue'] })
    expect(res.status).toBe(201)
    expect(res.body.fullName).toBe('Dr. Sarah')
    expect(res.body.color).toBe('#04CF9E')
    expect(res.body.isActive).toBe(true)
    expect(res.body.qualifications).toEqual(['BDS'])
    expect('branchId' in res.body).toBe(false)
  })

  it('returns 400 when fullName is missing', async () => {
    const res = await request(app).post('/api/dentists').set(auth).send({ specialty: 'Ortho' })
    expect(res.status).toBe(400)
  })

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/dentists').send({ fullName: 'X' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/dentists', () => {
  it('lists dentists as an array', async () => {
    await seedDentist({ fullName: 'Dr. A' })
    await seedDentist({ fullName: 'Dr. B' })
    const res = await request(app).get('/api/dentists').set(auth)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })
})

describe('GET /api/dentists/:id', () => {
  it('returns a dentist when found', async () => {
    const d = await seedDentist({ fullName: 'Dr. Find' })
    const res = await request(app).get(`/api/dentists/${d.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe('Dr. Find')
  })

  it('returns 404 when not found', async () => {
    const res = await request(app).get('/api/dentists/00000000-0000-0000-0000-000000000000').set(auth)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/dentists/:id', () => {
  it('updates a dentist', async () => {
    const d = await seedDentist({ fullName: 'Before' })
    const res = await request(app).patch(`/api/dentists/${d.id}`).set(auth).send({ fullName: 'After' })
    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe('After')
  })

  it('returns 404 for a missing dentist', async () => {
    const res = await request(app)
      .patch('/api/dentists/00000000-0000-0000-0000-000000000000')
      .set(auth)
      .send({ fullName: 'X' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/dentists/:id (deactivate)', () => {
  it('deactivates the dentist and returns success', async () => {
    const d = await seedDentist()
    const res = await request(app).delete(`/api/dentists/${d.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const after = await request(app).get(`/api/dentists/${d.id}`).set(auth)
    expect(after.body.isActive).toBe(false)
  })
})
