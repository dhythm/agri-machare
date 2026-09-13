import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { PGlite } from '@electric-sql/pglite'

const migrationsDir = path.join(process.cwd(), 'db', 'migrations')

/**
 * Apply every `db/migrations/*.sql` file not yet recorded in
 * `schema_migrations`, in filename order, each inside a transaction.
 * Returns the names that were applied.
 */
export async function migrate(db: PGlite): Promise<string[]> {
  await db.exec(
    `create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`,
  )
  const applied = new Set(
    (
      await db.query<{ name: string }>(`select name from schema_migrations`)
    ).rows.map((row) => row.name),
  )
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort()
  const newlyApplied: string[] = []
  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    await db.transaction(async (tx) => {
      await tx.exec(sql)
      await tx.query(`insert into schema_migrations (name) values ($1)`, [file])
    })
    newlyApplied.push(file)
  }
  return newlyApplied
}
