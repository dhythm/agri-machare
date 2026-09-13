export type Entity = { id: string }

/**
 * Storage contract for one collection. Every method is asynchronous so a
 * database-backed implementation can replace the in-memory one without
 * touching the services that call it.
 */
export type Repository<T extends Entity> = {
  list(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  create(entity: T): Promise<T>
  update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<T | undefined>
  delete(id: string): Promise<boolean>
}
