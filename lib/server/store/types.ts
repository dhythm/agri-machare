import type { Listing, ThreadStatus, TransportJob } from '@/lib/data'
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
  /** Id of the signed-in user who sent it, when the form required login. */
  userId?: string
  receivedAt: string
  payload: Record<string, unknown>
  status?: ThreadStatus
}

/** A reply inside an inquiry or application thread. */
export type Message = {
  id: string
  /** Id of the submission that opened the thread. */
  threadId: string
  senderUserId: string
  body: string
  createdAt: string
}

export type StoreKind = 'memory' | 'pglite'

export type Store = {
  kind: StoreKind
  listings: Repository<Listing>
  transportJobs: Repository<TransportJob>
  submissions: Repository<Submission>
  messages: Repository<Message>
  /** Drop every row and load the sample data again. */
  reset(): Promise<void>
  /** Release resources; the store must not be used afterwards. */
  close(): Promise<void>
}
