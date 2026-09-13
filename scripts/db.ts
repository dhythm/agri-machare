/**
 * PGlite maintenance for `pnpm dev:agent` environments.
 *
 *   pnpm db:migrate         apply pending migrations (and seed when empty)
 *   pnpm db:reset           delete the database and recreate it from scratch
 *   pnpm db:sql "<query>"   run one SQL statement and print the rows
 *
 * The data directory is PGLITE_DATA_DIR (default .data/pglite).
 */
import { rm } from 'node:fs/promises'
import { defaultPgliteDataDir, openPglite } from '../lib/server/store/pglite'

const dataDir = process.env.PGLITE_DATA_DIR?.trim() || defaultPgliteDataDir
const [command, ...rest] = process.argv.slice(2)

async function main(): Promise<void> {
  switch (command) {
    case 'migrate': {
      const db = await openPglite(dataDir)
      const applied = await db.query<{ name: string }>(
        `select name from schema_migrations order by name`,
      )
      console.log(`database: ${dataDir}`)
      console.log(`migrations: ${applied.rows.map((r) => r.name).join(', ')}`)
      await db.close()
      return
    }
    case 'reset': {
      if (dataDir.startsWith('memory://')) {
        throw new Error('reset needs a file-backed PGLITE_DATA_DIR.')
      }
      await rm(dataDir, { recursive: true, force: true })
      const db = await openPglite(dataDir)
      const count = await db.query<{ count: number }>(
        `select count(*)::int as count from listings`,
      )
      console.log(`reset ${dataDir}: ${count.rows[0].count} listings seeded`)
      await db.close()
      return
    }
    case 'sql': {
      const sql = rest.join(' ').trim()
      if (!sql) throw new Error('usage: pnpm db:sql "<query>"')
      const db = await openPglite(dataDir)
      const result = await db.query(sql)
      console.table(result.rows)
      console.log(`${result.rows.length} rows`)
      await db.close()
      return
    }
    default:
      throw new Error('usage: scripts/db.ts <migrate|reset|sql>')
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
