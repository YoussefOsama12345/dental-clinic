import { describe, expect, it } from 'vitest'
import type { Request, Response } from 'express'
import { notFoundMiddleware } from '../../../src/middleware/not-found.middleware'

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

describe('notFoundMiddleware', () => {
  it('responds with a 404 NOT_FOUND envelope', () => {
    const res = mockRes()
    notFoundMiddleware({} as Request, res)
    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ code: 'NOT_FOUND', message: 'Route not found.' })
  })
})
