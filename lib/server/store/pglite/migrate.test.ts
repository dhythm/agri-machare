// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { afterEach, describe, expect, it } from 'vitest'
import { migrate } from './migrate'

let db: PGlite

afterEach(async () => {
  await db?.close()
})

describe('migrate', () => {
  it('applies every migration once and records it', async () => {
    db = new PGlite('memory://')
    const first = await migrate(db)
    expect(first.length).toBeGreaterThanOrEqual(1)
    expect(first[0]).toBe('0001_initial.sql')
    const tables = await db.query<{ table_name: string }>(
      `select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
    )
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      'listings',
      'schema_migrations',
      'submissions',
      'transport_jobs',
    ])
    expect(await migrate(db)).toEqual([])
  })
})
