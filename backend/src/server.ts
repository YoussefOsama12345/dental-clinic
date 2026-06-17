import 'dotenv/config'
import { createApp } from './app'
import { closeDatabaseConnection } from './config/database.config'
import { env } from './config/env'

const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`dentAI backend listening on http://localhost:${env.PORT}`)
})

const shutdown = async () => {
  server.close(async () => {
    await closeDatabaseConnection()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
