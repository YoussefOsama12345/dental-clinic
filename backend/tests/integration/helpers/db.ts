import { sql } from 'drizzle-orm'
import { db, databasePool } from '../../../src/config/database.config'

/**
 * Truncate every domain table between tests so each case starts clean.
 * RESTART IDENTITY + CASCADE keeps FK-linked rows (e.g. appointments) consistent.
 */
export async function truncateAll(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE appointments, password_reset_codes, patients, staff, dentists, users RESTART IDENTITY CASCADE`,
  )
}

export async function closeDb(): Promise<void> {
  await databasePool.end()
}

export { db }
