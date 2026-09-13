import type { Listing, TransportJob } from '@/lib/data'
import { listings, transportJobs } from '../data'
import { createMemoryRepository } from './memory-repository'
import type { Repository } from './repository'
import type { Store, Submission } from './types'

export function createMemoryStore(): Store {
  let store = {
    listings: createMemoryRepository(listings),
    transportJobs: createMemoryRepository(transportJobs),
    submissions: createMemoryRepository<Submission>([]),
  }
  const proxy = <T extends { id: string }>(
    pick: () => Repository<T>,
  ): Repository<T> => ({
    list: () => pick().list(),
    get: (id) => pick().get(id),
    create: (entity) => pick().create(entity),
    update: (id, patch) => pick().update(id, patch),
    delete: (id) => pick().delete(id),
  })
  return {
    kind: 'memory',
    listings: proxy<Listing>(() => store.listings),
    transportJobs: proxy<TransportJob>(() => store.transportJobs),
    submissions: proxy<Submission>(() => store.submissions),
    async reset() {
      store = {
        listings: createMemoryRepository(listings),
        transportJobs: createMemoryRepository(transportJobs),
        submissions: createMemoryRepository<Submission>([]),
      }
    },
    async close() {},
  }
}
