import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest(async () => {
      const migrationsPath = fileURLToPath(new URL('./migrations', import.meta.url))
      const migrations = await readD1Migrations(migrationsPath)

      return {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }
    }),
  ],
  test: {
    setupFiles: ['./test/apply-migrations.ts'],
  },
})
