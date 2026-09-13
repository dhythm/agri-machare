import type { Listing, ThreadStatus, TransportJob } from '@/lib/data'
import type { RentalStatus } from '@/lib/rent-to-own'
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

/** A rental agreement; pricing is copied from the listing at request time. */
export type Rental = {
  id: string
  listingId: string
  renterUserId: string
  startDate: string
  endDate: string
  days: number
  rentPerDay: number
  rentTotal: number
  salePrice?: number
  creditRate?: number
  creditCap?: number
  status: RentalStatus
  /** Price after the rent credit, set when converted to a purchase. */
  purchasePrice?: number
  createdAt: string
  updatedAt: string
}

/** Suspension state of an account; `id` is the user id. No row means active. */
export type AccountStatus = {
  id: string
  status: 'active' | 'suspended'
  note?: string
  updatedAt: string
}

export type NotificationKind =
  'inquiry' | 'application' | 'reply' | 'threadStatus' | 'rental' | 'moderation'

/** In-app notification for one user; `readAt` is set when opened. */
export type Notification = {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body?: string
  href: string
  createdAt: string
  readAt?: string
}

export type ReviewSourceKind = 'rental' | 'thread'

/** A buyer's or renter's rating of the seller after one finished deal. */
export type Review = {
  id: string
  listingId: string
  sellerUserId: string
  reviewerUserId: string
  sourceKind: ReviewSourceKind
  /** Rental id or thread (submission) id the review is about. */
  sourceId: string
  rating: number
  comment?: string
  createdAt: string
}

/** When a participant last opened a thread; `id` is `<threadId>:<userId>`. */
export type ThreadRead = {
  id: string
  threadId: string
  userId: string
  readAt: string
}

export type StoreKind = 'memory' | 'pglite'

export type Store = {
  kind: StoreKind
  listings: Repository<Listing>
  transportJobs: Repository<TransportJob>
  submissions: Repository<Submission>
  messages: Repository<Message>
  rentals: Repository<Rental>
  accountStatuses: Repository<AccountStatus>
  notifications: Repository<Notification>
  reviews: Repository<Review>
  threadReads: Repository<ThreadRead>
  /** Drop every row and load the sample data again. */
  reset(): Promise<void>
  /** Release resources; the store must not be used afterwards. */
  close(): Promise<void>
}
