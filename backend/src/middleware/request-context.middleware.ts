import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header('x-request-id') || randomUUID()
  req.id = requestId
  res.setHeader('x-request-id', requestId)

  const startedAt = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    const log = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      userId: req.auth?.sub,
    }
    if (res.statusCode >= 500) console.error(log)
    else console.info(log)
  })

  next()
}
