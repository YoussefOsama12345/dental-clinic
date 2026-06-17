import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { APP_HEADERS } from '../constants/app.constants'
import { unauthorized } from '../utils/app-error'

export interface JwtPayload {
  sub: string
  email: string
  role?: string
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.header(APP_HEADERS.authorization)
    if (!header?.startsWith('Bearer ')) throw unauthorized('Authentication required.')
    req.auth = jwt.verify(header.slice(7), env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
      audience: env.JWT_AUDIENCE,
    }) as JwtPayload
    next()
  } catch {
    next(unauthorized('Invalid or expired token.'))
  }
}
