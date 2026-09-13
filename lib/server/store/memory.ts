import type { Listing, TransportJob } from '@/lib/data'
import { listings, transportJobs } from '../data'
import { createMemoryRepository } from './memory-repository'
import type { Repository } from './repository'
import type {
  AccountStatus,
  Message,
  Notification,
  Rental,
  Review,
  Store,
  Submission,
  ThreadRead,
} from './types'

export function createMemoryStore(): Store {
  let store = {
    listings: createMemoryRepository(listings),
    transportJobs: createMemoryRepository(transportJobs),
    submissions: createMemoryRepository<Submission>([]),
    messages: createMemoryRepository<Message>([]),
    rentals: createMemoryRepository<Rental>([]),
    accountStatuses: createMemoryRepository<AccountStatus>([]),
    notifications: createMemoryRepository<Notification>([]),
    reviews: createMemoryRepository<Review>([]),
    threadReads: createMemoryRepository<ThreadRead>([]),
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
    rentals: proxy<Rental>(() => store.rentals),
    accountStatuses: proxy<AccountStatus>(() => store.accountStatuses),
    notifications: proxy<Notification>(() => store.notifications),
    reviews: proxy<Review>(() => store.reviews),
    threadReads: proxy<ThreadRead>(() => store.threadReads),
    async reset() {
      store = {
        listings: createMemoryRepository(listings),
        transportJobs: createMemoryRepository(transportJobs),
        submissions: createMemoryRepository<Submission>([]),
        messages: createMemoryRepository<Message>([]),
        rentals: createMemoryRepository<Rental>([]),
        accountStatuses: createMemoryRepository<AccountStatus>([]),
        notifications: createMemoryRepository<Notification>([]),
        reviews: createMemoryRepository<Review>([]),
        threadReads: createMemoryRepository<ThreadRead>([]),
      }
    },
    async close() {},
  }
}
