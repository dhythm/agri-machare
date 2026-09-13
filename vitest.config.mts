import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The PGlite variant boots an embedded Postgres per worker (WASM start,
// migrations, seed) inside the first test of each file, which exceeds the
// default 5s budget when many files run in parallel.
const usesPglite = process.env.DATA_STORE === 'pglite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    testTimeout: usesPglite ? 20_000 : 5_000,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/api/**/*.ts',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
    },
  },
})
