import type { Listing, TransportJob } from '@/lib/data'
import { listings, transportJobs } from '../data'
import { createMemoryRepository } from './memory-repository'
import type { Repository } from './repository'
import type { Message, Store, Submission } from './types'

export function createMemoryStore(): Store {
  let store = {
    listings: createMemoryRepository(listings),
    transportJobs: createMemoryRepository(transportJobs),
    submissions: createMemoryRepository<Submission>([]),
    messages: createMemoryRepository<Message>([]),
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
    messages: proxy<Message>(() => store.messages),
    async reset() {
      store = {
        listings: createMemoryRepository(listings),
        transportJobs: createMemoryRepository(transportJobs),
        submissions: createMemoryRepository<Submission>([]),
        messages: createMemoryRepository<Message>([]),
      }
    },
    async close() {},
  }
}
