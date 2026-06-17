// Runs before any test module imports backend source. The backend's
// config/env.ts validates process.env at import time and database.config.ts
// opens a Postgres pool at import time, so these MUST be set here first.
//
// Real values can be overridden by the shell environment (e.g. CI) — we only
// fill in sensible local-Docker defaults when a variable is missing.

const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '4001',
  // Separate database so tests never touch dev data.
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/clinic_management_test',
  JWT_SECRET: 'test-jwt-secret-value',
  JWT_ISSUER: 'dentai-test',
  JWT_AUDIENCE: 'authenticated',
  AUTH_MODE: 'supabase',
  SUPABASE_AUTH_URL: 'http://localhost:9999',
  // Must match GOTRUE_JWT_SECRET in docker-compose.yml for the real
  // Supabase integration test to verify tokens correctly.
  SUPABASE_JWT_SECRET: 'super-secret-jwt-token-with-at-least-32-characters-long',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_SECURE: 'false',
  SMTP_FROM_EMAIL: 'no-reply@dentai.test',
  SMTP_FROM_NAME: 'dentAI Test',
}

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value
}
