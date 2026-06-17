import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { NextFunction, Request, Response } from 'express'
import { errorMiddleware } from '../../../src/middleware/error.middleware'
import { badRequest, conflict } from '../../../src/utils/app-error'

function mockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res as unknown as Response & { statusCode: number; body: any }
}

const req = {} as Request
const next = vi.fn() as unknown as NextFunction

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('errorMiddleware', () => {
  it('maps a ZodError to a 400 VALIDATION_ERROR with details', () => {
    const res = mockRes()
    let zodErr: unknown
    try {
      z.object({ name: z.string() }).parse({})
    } catch (e) {
      zodErr = e
    }
    errorMiddleware(zodErr, req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(res.body.details).toBeDefined()
  })

  it('maps an AppError to its status, code, message, and details', () => {
    const res = mockRes()
    errorMiddleware(conflict('dup', { conflictId: 'x' }), req, res, next)
    expect(res.statusCode).toBe(409)
    expect(res.body).toMatchObject({ code: 'CONFLICT', message: 'dup', details: { conflictId: 'x' } })
  })

  it('omits details when an AppError has none', () => {
    const res = mockRes()
    errorMiddleware(badRequest('bad'), req, res, next)
    expect(res.body.code).toBe('BAD_REQUEST')
    expect('details' in res.body).toBe(false)
  })

  it('maps an unexpected error to a generic 500 (no internal leak)', () => {
    const res = mockRes()
    errorMiddleware(new Error('secret stack detail'), req, res, next)
    expect(res.statusCode).toBe(500)
    expect(res.body.code).toBe('INTERNAL_ERROR')
    expect(res.body.message).toBe('Something went wrong on the server.')
    expect(JSON.stringify(res.body)).not.toContain('secret stack detail')
  })
})
