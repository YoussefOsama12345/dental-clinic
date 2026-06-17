import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../../../src/app'
import { authHeader } from '../helpers/auth'
import { closeDb, truncateAll } from '../helpers/db'
import { seedDentist, seedPatient } from '../helpers/fixtures'

let app: Express
const auth = authHeader()

beforeAll(() => {
  app = createApp()
})
beforeEach(() => truncateAll())
afterAll(() => closeDb())

describe('POST /api/patients', () => {
  it('creates a patient and returns 201 with the mapped body', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set(auth)
      .send({ firstName: 'Alice', lastName: 'Smith', gender: 'female', allergies: ['latex'] })

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.firstName).toBe('Alice')
    expect(res.body.allergies).toEqual(['latex'])
    expect(res.body.status).toBe('active')
    expect('branchId' in res.body).toBe(false)
    expect('insuranceProvider' in res.body).toBe(false)
  })

  it('returns 400 VALIDATION_ERROR when required fields are missing', async () => {
    const res = await request(app).post('/api/patients').set(auth).send({ firstName: 'NoLast' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('returns 401 without an auth token', async () => {
    const res = await request(app).post('/api/patients').send({ firstName: 'X', lastName: 'Y', gender: 'male' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/patients', () => {
  it('returns a paginated envelope', async () => {
    await seedPatient({ firstName: 'Anna', lastName: 'Apple' })
    await seedPatient({ firstName: 'Bob', lastName: 'Berry' })

    const res = await request(app).get('/api/patients').set(auth)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ page: 1, pageSize: 20 })
    expect(res.body.total).toBe(2)
    expect(res.body.data).toHaveLength(2)
  })

  it('excludes archived patients by default but includes them with status=all', async () => {
    await seedPatient({ firstName: 'Active', lastName: 'One', status: 'active' })
    await seedPatient({ firstName: 'Archived', lastName: 'Two', status: 'archived' })

    const def = await request(app).get('/api/patients').set(auth)
    expect(def.body.total).toBe(1)

    const all = await request(app).get('/api/patients?status=all').set(auth)
    expect(all.body.total).toBe(2)
  })

  it('paginates with page and pageSize', async () => {
    for (let i = 0; i < 3; i++) await seedPatient({ lastName: `L${i}` })
    const res = await request(app).get('/api/patients?page=1&pageSize=2').set(auth)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.total).toBe(3)
    expect(res.body.pageSize).toBe(2)
  })

  it('filters by search term', async () => {
    await seedPatient({ firstName: 'Searchable', lastName: 'Zebra' })
    await seedPatient({ firstName: 'Other', lastName: 'Person' })
    const res = await request(app).get('/api/patients?search=Zebra').set(auth)
    expect(res.body.total).toBe(1)
    expect(res.body.data[0].lastName).toBe('Zebra')
  })

  it('returns 400 for an invalid page value', async () => {
    const res = await request(app).get('/api/patients?page=0').set(auth)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/patients/:id', () => {
  it('returns the patient when it exists', async () => {
    const p = await seedPatient({ firstName: 'Find', lastName: 'Me' })
    const res = await request(app).get(`/api/patients/${p.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Find')
  })

  it('returns 404 for a missing patient', async () => {
    const res = await request(app).get(`/api/patients/${'0'.repeat(8)}-0000-0000-0000-000000000000`).set(auth)
    expect(res.status).toBe(404)
    expect(res.body.code).toBe('NOT_FOUND')
  })
})

describe('PATCH /api/patients/:id', () => {
  it('updates fields and returns the new state', async () => {
    const p = await seedPatient({ firstName: 'Before' })
    const res = await request(app).patch(`/api/patients/${p.id}`).set(auth).send({ firstName: 'After' })
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('After')
  })

  it('returns 404 when updating a missing patient', async () => {
    const res = await request(app)
      .patch('/api/patients/00000000-0000-0000-0000-000000000000')
      .set(auth)
      .send({ firstName: 'X' })
    expect(res.status).toBe(404)
  })

  it('returns 400 when an updated field is invalid', async () => {
    const p = await seedPatient()
    const res = await request(app).patch(`/api/patients/${p.id}`).set(auth).send({ firstName: '' })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/patients/:id (soft archive)', () => {
  it('archives the patient and returns success', async () => {
    const p = await seedPatient()
    const res = await request(app).delete(`/api/patients/${p.id}`).set(auth)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    // It should no longer appear in the default list.
    const list = await request(app).get('/api/patients').set(auth)
    expect(list.body.total).toBe(0)
  })

  it('returns 404 when archiving a missing patient', async () => {
    const res = await request(app).delete('/api/patients/00000000-0000-0000-0000-000000000000').set(auth)
    expect(res.status).toBe(404)
  })
})

describe('patient ↔ dentist relationship', () => {
  it('links a patient to a primary dentist', async () => {
    const d = await seedDentist({ fullName: 'Dr. Primary' })
    const res = await request(app)
      .post('/api/patients')
      .set(auth)
      .send({ firstName: 'Linked', lastName: 'Patient', gender: 'male', primaryDentistId: d.id })
    expect(res.status).toBe(201)
    expect(res.body.primaryDentistId).toBe(d.id)

    const filtered = await request(app).get(`/api/patients?dentistId=${d.id}`).set(auth)
    expect(filtered.body.total).toBe(1)
  })
})
