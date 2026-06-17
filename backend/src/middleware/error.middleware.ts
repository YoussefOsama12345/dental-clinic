import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/app-error'

export const errorMiddleware = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Request validation failed.', requestId: req.id, details: error.flatten() })
    return
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      requestId: req.id,
      ...(error.details !== undefined ? { details: error.details } : {}),
    })
    return
  }

  console.error(error)
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.', requestId: req.id })
}
