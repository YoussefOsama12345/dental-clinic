import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'

type SchemaSet = {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export const validate = (schemas: SchemaSet) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body)
    if (schemas.query) {
      Object.defineProperty(req, 'query', {
        value: schemas.query.parse(req.query),
        writable: true,
        enumerable: true,
        configurable: true,
      })
    }
    if (schemas.params) req.params = schemas.params.parse(req.params)
    next()
  } catch (error) {
    next(error)
  }
}
