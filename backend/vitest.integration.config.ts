import { defineConfig } from 'vitest/config'

// INTEGRATION tests: hit a real Postgres test database (and, for one test, the
// real Supabase GoTrue container). Requires the docker-compose stack running.
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup/env.setup.ts'],
    globalSetup: ['./tests/integration/setup/global-setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // Tests share one database and truncate between cases, so run files
    // sequentially to avoid cross-file row contention.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
})
