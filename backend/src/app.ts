import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { requireAuth } from './middleware/auth.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import { notFoundMiddleware } from './middleware/not-found.middleware'
import { apiRateLimit } from './middleware/rate-limit.middleware'
import { appointmentsRouter } from './modules/appointments/appointments.routes'
import { authRouter } from './modules/auth/auth.routes'
import { dentistsRouter } from './modules/dentists/dentists.routes'
import { patientsRouter } from './modules/patients/patients.routes'
import { staffRouter } from './modules/staff/staff.routes'
import { createOpenApiDocument } from './openapi'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', env.TRUST_PROXY)

  const openApiDocument = createOpenApiDocument()
  app.get('/api/openapi.json', (_req, res) => res.json(openApiDocument))
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'dentAI API Docs',
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  }))

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigins, credentials: false }))
  app.use(express.json({ limit: '1mb' }))
  if (env.isDevelopment) app.use(morgan('dev'))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, authMode: env.AUTH_MODE })
  })

  app.use('/api/auth', authRouter)
  app.use('/api', apiRateLimit, requireAuth)
  app.use('/api/patients', patientsRouter)
  app.use('/api/dentists', dentistsRouter)
  app.use('/api/staff', staffRouter)
  app.use('/api/appointments', appointmentsRouter)

  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
