import type { PGlite, Transaction } from '@electric-sql/pglite'
import type { Entity, Repository } from '../repository'

export type Row = Record<string, unknown>

/** How one entity type maps onto one table. `columns` excludes `seq`. */
export type TableSpec<T extends Entity> = {
  table: string
  columns: string[]
  toRow(entity: T): unknown[]
  fromRow(row: Row): T
}

export type Queryable = Pick<PGlite | Transaction, 'query'>

/** Drop keys whose value is `undefined` so NULL columns stay absent. */
export function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T
}

export function isoString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return undefined
}

export function nullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value
}

export function createSqlRepository<T extends Entity>(
  spec: TableSpec<T>,
  connect: () => Promise<Queryable>,
): Repository<T> {
  const columnList = spec.columns.join(', ')
  const placeholders = spec.columns.map((_, index) => `$${index + 1}`)
  const assignments = spec.columns
    .map((column, index) => `${column} = $${index + 1}`)
    .join(', ')

  return {
    async list() {
      const db = await connect()
      const result = await db.query<Row>(
        `select ${columnList} from ${spec.table} order by seq desc`,
      )
      return result.rows.map(spec.fromRow)
    },
    async get(id) {
      const db = await connect()
      const result = await db.query<Row>(
        `select ${columnList} from ${spec.table} where id = $1`,
        [id],
      )
      return result.rows[0] ? spec.fromRow(result.rows[0]) : undefined
    },
    async create(entity) {
      const db = await connect()
      await db.query(
        `insert into ${spec.table} (${columnList}) values (${placeholders.join(', ')})`,
        spec.toRow(entity),
      )
      return (await this.get(entity.id)) as T
    },
    async update(id, patch) {
      const current = await this.get(id)
      if (!current) return undefined
      const next = { ...current, ...patch, id } as T
      const db = await connect()
      await db.query(
        `update ${spec.table} set ${assignments} where id = $1`,
        spec.toRow(next),
      )
      return this.get(id)
    },
    async delete(id) {
      const db = await connect()
      const result = await db.query(`delete from ${spec.table} where id = $1`, [
        id,
      ])
      return (result.affectedRows ?? 0) > 0
    },
  }
}
