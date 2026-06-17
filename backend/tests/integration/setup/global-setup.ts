import { execSync } from 'node:child_process'
import { Client } from 'pg'

// Vitest globalSetup: runs ONCE before the integration suite.
// 1. Ensures the dedicated test database exists.
// 2. Pushes the Drizzle schema into it (creates all tables).
//
// The DATABASE_URL is set by tests/setup/env.setup.ts; we re-derive the same
// default here so this file works even when run in isolation.

const TEST_DB_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/clinic_management_test'

function parseDbName(url: string): { adminUrl: string; dbName: string } {
  const parsed = new URL(url)
  const dbName = parsed.pathname.replace(/^\//, '')
  // Connect to the maintenance "postgres" database to create the test DB.
  parsed.pathname = '/postgres'
  return { adminUrl: parsed.toString(), dbName }
}

export default async function globalSetup() {
  const { adminUrl, dbName } = parseDbName(TEST_DB_URL)

  // Create the test database if it does not exist.
  const admin = new Client({ connectionString: adminUrl })
  await admin.connect()
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`)
  }
  await admin.end()

  // Push the Drizzle schema into the test database. `--force` skips the
  // interactive confirmation drizzle-kit would otherwise prompt for.
  execSync('npx drizzle-kit push --force', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  })
}
