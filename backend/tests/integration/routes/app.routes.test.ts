import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../../../src/app'
import { signTestToken } from '../helpers/auth'
import { closeDb } from '../helpers/db'

let app: Express

beforeAll(() => {
  app = createApp()
})
afterAll(() => closeDb())

describe('GET /api/health', () => {
  it('is public and reports ok + auth mode', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, authMode: 'supabase' })
  })
})

describe('authentication guard on /api', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/patients')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 for a malformed Authorization header', async () => {
    const res = await request(app).get('/api/patients').set('Authorization', 'Token abc')
    expect(res.status).toBe(401)
  })

  it('returns 401 for a token signed with the wrong secret', async () => {
    const bad = signTestToken()
      .split('.')
      .map((part, i) => (i === 2 ? 'tampered' : part))
      .join('.')
    const res = await request(app).get('/api/patients').set('Authorization', `Bearer ${bad}`)
    expect(res.status).toBe(401)
  })

  it('allows access with a valid token', async () => {
    const res = await request(app).get('/api/patients').set('Authorization', `Bearer ${signTestToken()}`)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/auth/me', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('unknown routes', () => {
  it('returns a 404 NOT_FOUND envelope', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.code).toBe('NOT_FOUND')
  })
})

describe('validation errors on auth routes (public)', () => {
  it('returns 400 for an invalid login body', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})
