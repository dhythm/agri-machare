import { mkdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { listings, transportJobs } from '../../data'
import type { Store } from '../types'
import { migrate } from './migrate'
import { createSqlRepository } from './sql-repository'
import {
  accountStatusTable,
  listingTable,
  messageTable,
  rentalTable,
  submissionTable,
  transportJobTable,
} from './tables'

export type PgliteStoreOptions = {
  /** Directory for the database files, or `memory://` for a volatile one. */
  dataDir: string
}

export const defaultPgliteDataDir = '.data/pglite'

async function seed(db: PGlite): Promise<void> {
  // Rows list newest-first by `seq`, so insert the seed back to front to
  // keep the sample order (trc-001 first).
  await db.transaction(async (tx) => {
    const listingTx = createSqlRepository(listingTable, async () => tx)
    const jobTx = createSqlRepository(transportJobTable, async () => tx)
    for (const listing of [...listings].reverse())
      await listingTx.create(listing)
    for (const job of [...transportJobs].reverse()) await jobTx.create(job)
  })
}

async function seedIfEmpty(db: PGlite): Promise<void> {
  const result = await db.query<{ count: number }>(
    `select count(*)::int as count from listings`,
  )
  if (result.rows[0].count === 0) await seed(db)
}

/** Open (or create) the database, apply migrations, and seed when empty. */
export async function openPglite(dataDir: string): Promise<PGlite> {
  if (!dataDir.startsWith('memory://')) {
    await mkdir(dataDir, { recursive: true })
  }
  const db = new PGlite(dataDir)
  await db.waitReady
  await migrate(db)
  await seedIfEmpty(db)
  return db
}

export function createPgliteStore(options: PgliteStoreOptions): Store {
  const ready = openPglite(options.dataDir)
  const connect = () => ready
  return {
    kind: 'pglite',
    listings: createSqlRepository(listingTable, connect),
    transportJobs: createSqlRepository(transportJobTable, connect),
    submissions: createSqlRepository(submissionTable, connect),
    messages: createSqlRepository(messageTable, connect),
    rentals: createSqlRepository(rentalTable, connect),
    accountStatuses: createSqlRepository(accountStatusTable, connect),
    async reset() {
      const db = await ready
      await db.exec(
        `truncate listings, transport_jobs, submissions, messages, rentals, account_statuses restart identity`,
      )
      await seed(db)
    },
    async close() {
      const db = await ready
      await db.close()
    },
  }
}
