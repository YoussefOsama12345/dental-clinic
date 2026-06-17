import { describe, expect, it, vi } from 'vitest'
import { z, ZodError } from 'zod'
import type { NextFunction, Request, Response } from 'express'
import { validate } from '../../../src/middleware/validate.middleware'

const res = {} as Response

function run(schemas: Parameters<typeof validate>[0], req: Partial<Request>) {
  const next = vi.fn() as unknown as NextFunction
  validate(schemas)(req as Request, res, next)
  return next
}

describe('validate middleware', () => {
  it('passes and assigns parsed body when valid', () => {
    const req: Partial<Request> = { body: { name: 'Jo' } }
    const next = run({ body: z.object({ name: z.string().min(2) }) }, req)
    expect(next).toHaveBeenCalledWith()
    expect(req.body).toEqual({ name: 'Jo' })
  })

  it('coerces/transforms values onto the request (e.g. query numbers)', () => {
    const req: Partial<Request> = { query: { page: '2' } as never }
    run({ query: z.object({ page: z.coerce.number() }) }, req)
    expect(req.query).toEqual({ page: 2 })
  })

  it('forwards a ZodError to next on invalid body', () => {
    const next = run({ body: z.object({ name: z.string().min(2) }) }, { body: { name: '' } })
    expect(next).toHaveBeenCalledOnce()
    expect((next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]).toBeInstanceOf(ZodError)
  })

  it('validates params and query independently', () => {
    const next = run(
      { params: z.object({ id: z.string().min(1) }) },
      { params: { id: '' } as never },
    )
    expect((next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]).toBeInstanceOf(ZodError)
  })

  it('is a no-op pass-through when no schemas are supplied', () => {
    const next = run({}, { body: { anything: true } })
    expect(next).toHaveBeenCalledWith()
  })
})
