import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../../../src/app'
import { authHeader } from '../helpers/auth'
import { closeDb, truncateAll } from '../helpers/db'
import { seedDentist, seedStaff } from '../helpers/fixtures'

let app: Express
const auth = authHeader()

beforeAll(() => {
  app = createApp()
})
beforeEach(() => truncateAll())
afterAll(() => closeDb())

describe('POST /api/staff', () => {
  it('creates a staff member', async () => {
    const res = await request(app)
      .post('/api/staff')
      .set(auth)
      .send({ fullName: 'Reception Rita', role: 'reception' })
    expect(res.status).toBe(201)
    expect(res.body.fullName).toBe('Reception Rita')
    expect(res.body.status).toBe('active')
    expect('branchId' in res.body).toBe(false)
  })

  it('returns 400 when role is missing', async () => {
    const res = await request(app).post('/api/staff').set(auth).send({ fullName: 'NoRole' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/staff', () => {
  it('lists staff as an array', async () => {
    await seedStaff({ fullName: 'Staff A' })
    await seedStaff({ fullName: 'Staff B', role: 'nurse' })
    const res = await request(app).get('/api/staff').set(auth)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })
})

describe('GET /api/staff/roster', () => {
  it('combines dentists (Doctor) and staff into one roster', async () => {
    await seedDentist({ fullName: 'Dr. Roster' })
    await seedStaff({ fullName: 'Nurse Roster', role: 'nurse' })
    const res = await request(app).get('/api/staff/roster').set(auth)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const doctor = res.body.find((m: { kind: string }) => m.kind === 'dentist')
    const nurse = res.body.find((m: { kind: string }) => m.kind === 'staff')
    expect(doctor.role).toBe('Doctor')
    expect(nurse.role).toBe('Nurse')
  })

  it('filters the roster by role', async () => {
    await seedDentist({ fullName: 'Dr. Only' })
    await seedStaff({ fullName: 'Nurse Hidden', role: 'nurse' })
    const res = await request(app).get('/api/staff/roster?role=doctor').set(auth)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].role).toBe('Doctor')
  })
})

describe('GET /api/staff/:id', () => {
  it('returns a member when found', async () => {
    const s = await seedStaff({ fullName: 'Find Staff' })
    const res = await request(app).get(`/api/staff/${s.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe('Find Staff')
  })

  it('returns 404 when not found', async () => {
    const res = await request(app).get('/api/staff/00000000-0000-0000-0000-000000000000').set(auth)
    expect(res.status).toBe(404)
  })
})

describe('PATCH + DELETE /api/staff/:id', () => {
  it('updates a staff member', async () => {
    const s = await seedStaff({ status: 'active' })
    const res = await request(app).patch(`/api/staff/${s.id}`).set(auth).send({ status: 'on_leave' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('on_leave')
  })

  it('deactivates a staff member', async () => {
    const s = await seedStaff()
    const res = await request(app).delete(`/api/staff/${s.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const after = await request(app).get(`/api/staff/${s.id}`).set(auth)
    expect(after.body.status).toBe('inactive')
  })
})
