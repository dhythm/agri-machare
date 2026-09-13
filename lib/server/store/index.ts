import 'server-only'

import type { Listing, TransportJob } from '@/lib/data'
import { listings, transportJobs } from '../data'
import { createMemoryRepository } from './memory-repository'
import type { Repository } from './repository'

export type SubmissionKind =
  | 'listingInquiry'
  | 'transportRegistration'
  | 'transportApplication'
  | 'contact'

export type Submission = {
  id: string
  kind: SubmissionKind
  /** Id of the listing or transport job the submission refers to, if any. */
  targetId?: string
  receivedAt: string
  payload: Record<string, unknown>
}

export type Store = {
  listings: Repository<Listing>
  transportJobs: Repository<TransportJob>
  submissions: Repository<Submission>
}

function createStore(): Store {
  return {
    listings: createMemoryRepository(listings),
    transportJobs: createMemoryRepository(transportJobs),
    submissions: createMemoryRepository<Submission>([]),
  }
}

// Kept on globalThis so the data survives module re-evaluation during
// development (HMR). Volatile by design: restarting the process resets it.
const storeKey = Symbol.for('agri-machare.store')
type StoreHolder = { [storeKey]?: Store }

export function getStore(): Store {
  const holder = globalThis as StoreHolder
  holder[storeKey] ??= createStore()
  return holder[storeKey]
}

export function resetStore(): void {
  ;(globalThis as StoreHolder)[storeKey] = createStore()
}
