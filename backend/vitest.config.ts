import { defineConfig } from 'vitest/config'

// Default config = UNIT tests only. They never touch Postgres or Docker and
// run fast. Integration tests use vitest.integration.config.ts (which adds the
// database global setup). The `test` script runs both in sequence.
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup/env.setup.ts'],
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/server.ts', 'src/database.seed.ts', 'src/emails/**'],
    },
  },
})
