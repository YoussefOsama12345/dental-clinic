import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../../../src/app'
import { authHeader } from '../helpers/auth'
import { closeDb, truncateAll } from '../helpers/db'
import { seedAppointment, seedDentist, seedPatient } from '../helpers/fixtures'

let app: Express
const auth = authHeader()

let patientId: string
let dentistId: string

beforeAll(() => {
  app = createApp()
})

beforeEach(async () => {
  await truncateAll()
  const [p, d] = await Promise.all([seedPatient(), seedDentist()])
  patientId = p.id
  dentistId = d.id
})

afterAll(() => closeDb())

const slot = (startHour: number, endHour: number) => ({
  startsAt: `2025-06-01T${String(startHour).padStart(2, '0')}:00:00.000Z`,
  endsAt: `2025-06-01T${String(endHour).padStart(2, '0')}:00:00.000Z`,
})

describe('POST /api/appointments', () => {
  it('creates an appointment when the slot is free', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set(auth)
      .send({ patientId, dentistId, ...slot(9, 10), reason: 'checkup' })
    expect(res.status).toBe(201)
    expect(res.body.patientId).toBe(patientId)
    expect(res.body.status).toBe('scheduled')
    expect(res.body.reason).toBe('checkup')
    expect('branchId' in res.body).toBe(false)
  })

  it('rejects with 400 when end is not after start', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set(auth)
      .send({ patientId, dentistId, startsAt: slot(10, 9).startsAt, endsAt: slot(10, 9).endsAt })
    expect(res.status).toBe(400)
  })

  it('rejects with 409 when the dentist has an overlapping appointment', async () => {
    await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app)
      .post('/api/appointments')
      .set(auth)
      .send({ patientId, dentistId, ...slot(9, 10) }) // exact overlap
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('CONFLICT')
    expect(res.body.details.conflictId).toBeDefined()
  })

  it('allows back-to-back (touching) appointments without overlap', async () => {
    await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app)
      .post('/api/appointments')
      .set(auth)
      .send({ patientId, dentistId, ...slot(10, 11) }) // starts exactly when the other ends
    expect(res.status).toBe(201)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/appointments').set(auth).send({ patientId })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/appointments', () => {
  it('lists appointments, optionally filtered by dentist', async () => {
    await seedAppointment(patientId, dentistId, slot(9, 10))
    const otherDentist = await seedDentist({ fullName: 'Dr. Other' })
    await seedAppointment(patientId, otherDentist.id, slot(11, 12))

    const all = await request(app).get('/api/appointments').set(auth)
    expect(all.body).toHaveLength(2)

    const filtered = await request(app).get(`/api/appointments?dentistId=${dentistId}`).set(auth)
    expect(filtered.body).toHaveLength(1)
  })
})

describe('GET /api/appointments/availability', () => {
  it('reports available for a free slot', async () => {
    const res = await request(app)
      .get(`/api/appointments/availability?dentistId=${dentistId}&from=${slot(9, 10).startsAt}&to=${slot(9, 10).endsAt}`)
      .set(auth)
    expect(res.status).toBe(200)
    expect(res.body.available).toBe(true)
    expect(res.body.conflictId).toBeNull()
  })

  it('reports unavailable and returns the conflict id when busy', async () => {
    const appt = await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app)
      .get(`/api/appointments/availability?dentistId=${dentistId}&from=${slot(9, 10).startsAt}&to=${slot(9, 10).endsAt}`)
      .set(auth)
    expect(res.body.available).toBe(false)
    expect(res.body.conflictId).toBe(appt.id)
  })

  it('excludes a given appointment id (so editing its own slot is allowed)', async () => {
    const appt = await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app)
      .get(
        `/api/appointments/availability?dentistId=${dentistId}&from=${slot(9, 10).startsAt}&to=${slot(9, 10).endsAt}&excludeAppointmentId=${appt.id}`,
      )
      .set(auth)
    expect(res.body.available).toBe(true)
  })

  it('returns 400 when required query params are missing', async () => {
    const res = await request(app).get(`/api/appointments/availability?dentistId=${dentistId}`).set(auth)
    expect(res.status).toBe(400)
  })
})

describe('GET/PATCH/DELETE /api/appointments/:id', () => {
  it('fetches an appointment by id', async () => {
    const appt = await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app).get(`/api/appointments/${appt.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(appt.id)
  })

  it('returns 404 for a missing appointment', async () => {
    const res = await request(app).get('/api/appointments/00000000-0000-0000-0000-000000000000').set(auth)
    expect(res.status).toBe(404)
  })

  it('updates an appointment status to a non-blocking value without a conflict check', async () => {
    const appt = await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app).patch(`/api/appointments/${appt.id}`).set(auth).send({ status: 'cancelled' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('cancelled')
  })

  it('rejects an update that creates an overlap with another appointment', async () => {
    await seedAppointment(patientId, dentistId, slot(9, 10))
    const second = await seedAppointment(patientId, dentistId, slot(11, 12))
    const res = await request(app)
      .patch(`/api/appointments/${second.id}`)
      .set(auth)
      .send({ ...slot(9, 10) }) // move onto the first one's slot
    expect(res.status).toBe(409)
  })

  it('cancels (soft) an appointment via DELETE', async () => {
    const appt = await seedAppointment(patientId, dentistId, slot(9, 10))
    const res = await request(app).delete(`/api/appointments/${appt.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    const after = await request(app).get(`/api/appointments/${appt.id}`).set(auth)
    expect(after.body.status).toBe('cancelled')
  })
})
