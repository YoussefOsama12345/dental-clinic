import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from './env'
import * as schema from '../database.schema'

export const databasePool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
  max: 20,
})
export const db = drizzle({ client: databasePool, schema })

export async function closeDatabaseConnection() {
  await databasePool.end()
}
