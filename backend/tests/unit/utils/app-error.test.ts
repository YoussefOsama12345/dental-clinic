import { describe, expect, it } from 'vitest'
import { AppError, badRequest, conflict, notFound, unauthorized } from '../../../src/utils/app-error'

describe('AppError', () => {
  it('captures status code, code, message, and details', () => {
    const err = new AppError(418, 'TEAPOT', 'I am a teapot', { foo: 'bar' })
    expect(err).toBeInstanceOf(Error)
    expect(err.statusCode).toBe(418)
    expect(err.code).toBe('TEAPOT')
    expect(err.message).toBe('I am a teapot')
    expect(err.details).toEqual({ foo: 'bar' })
    expect(err.name).toBe('AppError')
  })

  it('allows details to be omitted', () => {
    const err = new AppError(500, 'X', 'y')
    expect(err.details).toBeUndefined()
  })
})

describe('error factory helpers', () => {
  it('badRequest produces a 400 BAD_REQUEST', () => {
    const err = badRequest('bad', { field: 'email' })
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.details).toEqual({ field: 'email' })
  })

  it('unauthorized produces a 401 UNAUTHORIZED', () => {
    const err = unauthorized('nope')
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('notFound produces a 404 NOT_FOUND', () => {
    const err = notFound('missing')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('conflict produces a 409 CONFLICT', () => {
    const err = conflict('dup', { conflictId: 'abc' })
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
    expect(err.details).toEqual({ conflictId: 'abc' })
  })
})
