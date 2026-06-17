import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { requireAuth, type JwtPayload } from '../../../src/middleware/auth.middleware'

const SECRET = process.env.SUPABASE_JWT_SECRET as string

function mockReqRes(header?: string) {
  const req = { header: vi.fn().mockReturnValue(header) } as unknown as Request
  const res = {} as Response
  const next = vi.fn() as unknown as NextFunction
  return { req, res, next }
}

beforeEach(() => vi.clearAllMocks())

describe('requireAuth', () => {
  it('attaches req.auth and calls next for a valid token', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com', role: 'authenticated' }, SECRET)
    const { req, res, next } = mockReqRes(`Bearer ${token}`)

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith()
    const auth = (req as Request & { auth?: JwtPayload }).auth
    expect(auth?.sub).toBe('u1')
    expect(auth?.email).toBe('a@b.com')
  })

  it('rejects when the Authorization header is missing', () => {
    const { req, res, next } = mockReqRes(undefined)
    requireAuth(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })

  it('rejects when the header is not a Bearer token', () => {
    const { req, res, next } = mockReqRes('Basic abc123')
    requireAuth(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('rejects a token signed with the wrong secret', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com' }, 'a-different-secret-value-1234567890')
    const { req, res, next } = mockReqRes(`Bearer ${token}`)
    requireAuth(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('rejects an expired token', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com' }, SECRET, { expiresIn: '-1s' })
    const { req, res, next } = mockReqRes(`Bearer ${token}`)
    requireAuth(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('rejects a malformed token', () => {
    const { req, res, next } = mockReqRes('Bearer not.a.jwt')
    requireAuth(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })
})
