import type { JwtPayload } from '../middleware/auth.middleware'

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload
      id?: string
    }
  }
}

export {}
