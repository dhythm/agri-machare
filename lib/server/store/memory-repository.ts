import type { Entity, Repository } from './repository'

/**
 * JSON round-trip: isolates the copy and drops keys whose value is
 * `undefined`, mirroring how a database leaves optional columns NULL.
 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** Volatile repository: newest entities first, stored as isolated copies. */
export function createMemoryRepository<T extends Entity>(
  seed: T[],
): Repository<T> {
  const entities = new Map<string, T>()
  for (const entity of seed) entities.set(entity.id, clone(entity))

  return {
    async list() {
      return [...entities.values()].map(clone)
    },
    async get(id) {
      const entity = entities.get(id)
      return entity ? clone(entity) : undefined
    },
    async create(entity) {
      if (entities.has(entity.id)) {
        throw new Error(`Entity "${entity.id}" already exists.`)
      }
      const stored = clone(entity)
      // Map preserves insertion order; rebuild so new entities list first.
      const rest = [...entities.entries()]
      entities.clear()
      entities.set(entity.id, stored)
      for (const [id, value] of rest) entities.set(id, value)
      return clone(stored)
    },
    async update(id, patch) {
      const current = entities.get(id)
      if (!current) return undefined
      const next = clone({ ...current, ...patch, id })
      entities.set(id, next)
      return clone(next)
    },
    async delete(id) {
      return entities.delete(id)
    },
  }
}
