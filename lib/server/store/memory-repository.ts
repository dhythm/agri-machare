import type { Entity, Repository } from './repository'

function clone<T>(value: T): T {
  return structuredClone(value)
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
      entities.set(entity.id, stored)
      // Map preserves insertion order; rebuild so new entities list first.
      const rest = [...entities.entries()].filter(([id]) => id !== entity.id)
      entities.clear()
      entities.set(entity.id, stored)
      for (const [id, value] of rest) entities.set(id, value)
      return clone(stored)
    },
    async update(id, patch) {
      const current = entities.get(id)
      if (!current) return undefined
      const next = { ...current, ...clone(patch), id }
      entities.set(id, next)
      return clone(next)
    },
    async delete(id) {
      return entities.delete(id)
    },
  }
}
