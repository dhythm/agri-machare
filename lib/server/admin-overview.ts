import 'server-only'

import type { Listing, ThreadStatus, TransportJob } from '@/lib/data'
import { configuredAccounts, type UserRole } from './auth/accounts'
import type { AccountStatus } from './store'
import type { RentalWithListing } from './rentals'
import { getStore, type Submission } from './store'

export type AdminCounts = {
  pendingListings: number
  pendingTransportJobs: number
  requestedRentals: number
  openThreads: number
  carriers: number
}

export type ThreadSummary = {
  id: string
  kind: 'listingInquiry' | 'transportApplication'
  targetId?: string
  targetName: string
  senderName: string
  status: ThreadStatus
  replyCount: number
  receivedAt: string
  payload: Record<string, unknown>
}

export type AccountSummary = {
  id: string
  name: string
  email: string
  role: UserRole
  listingCount: number
  transportJobCount: number
  rentalCount: number
  status: AccountStatus['status']
  note?: string
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isPending(entity: { moderationStatus?: string }): boolean {
  return entity.moderationStatus === 'pending'
}

export async function getAdminCounts(): Promise<AdminCounts> {
  const store = getStore()
  const [listings, jobs, rentals, submissions] = await Promise.all([
    store.listings.list(),
    store.transportJobs.list(),
    store.rentals.list(),
    store.submissions.list(),
  ])
  return {
    pendingListings: listings.filter(isPending).length,
    pendingTransportJobs: jobs.filter(isPending).length,
    requestedRentals: rentals.filter((rental) => rental.status === 'requested')
      .length,
    openThreads: submissions.filter(
      (submission) =>
        (submission.kind === 'listingInquiry' ||
          submission.kind === 'transportApplication') &&
        (submission.status ?? 'new') === 'new',
    ).length,
    carriers: submissions.filter(
      (submission) => submission.kind === 'transportRegistration',
    ).length,
  }
}

export async function listAllRentals(): Promise<RentalWithListing[]> {
  const store = getStore()
  const [rentals, listings] = await Promise.all([
    store.rentals.list(),
    store.listings.list(),
  ])
  const byId = new Map(listings.map((listing) => [listing.id, listing]))
  return rentals.map((rental) => ({
    rental,
    listing: byId.get(rental.listingId),
  }))
}

function targetNameOf(
  submission: Submission,
  listings: Map<string, Listing>,
  jobs: Map<string, TransportJob>,
): string {
  if (!submission.targetId) return '（対象なし）'
  const name =
    submission.kind === 'listingInquiry'
      ? listings.get(submission.targetId)?.name
      : jobs.get(submission.targetId)?.item
  return name ?? '（削除済み）'
}

export async function listThreadSummaries(
  kind: ThreadSummary['kind'],
): Promise<ThreadSummary[]> {
  const store = getStore()
  const [submissions, messages, listings, jobs] = await Promise.all([
    store.submissions.list(),
    store.messages.list(),
    store.listings.list(),
    store.transportJobs.list(),
  ])
  const listingById = new Map(listings.map((listing) => [listing.id, listing]))
  const jobById = new Map(jobs.map((job) => [job.id, job]))
  const replyCounts = new Map<string, number>()
  for (const message of messages)
    replyCounts.set(
      message.threadId,
      (replyCounts.get(message.threadId) ?? 0) + 1,
    )
  return submissions
    .filter((submission) => submission.kind === kind)
    .map((submission) => ({
      id: submission.id,
      kind,
      targetId: submission.targetId,
      targetName: targetNameOf(submission, listingById, jobById),
      senderName: text(submission.payload.name),
      status: submission.status ?? 'new',
      replyCount: replyCounts.get(submission.id) ?? 0,
      receivedAt: submission.receivedAt,
      payload: submission.payload,
    }))
}

export function listTransportApplications(): Promise<ThreadSummary[]> {
  return listThreadSummaries('transportApplication')
}

export async function listCarriers(): Promise<Submission[]> {
  const submissions = await getStore().submissions.list()
  return submissions.filter(
    (submission) => submission.kind === 'transportRegistration',
  )
}

/** Accounts come from the environment; passwords never leave accounts.ts. */
export async function listAccountSummaries(): Promise<AccountSummary[]> {
  const store = getStore()
  const [listings, jobs, rentals, statuses] = await Promise.all([
    store.listings.list(),
    store.transportJobs.list(),
    store.rentals.list(),
    store.accountStatuses.list(),
  ])
  const statusById = new Map(statuses.map((row) => [row.id, row]))
  return configuredAccounts().map(({ id, name, email, role }) => ({
    id,
    name,
    email,
    role,
    status: statusById.get(id)?.status ?? 'active',
    note: statusById.get(id)?.note,
    listingCount: listings.filter((listing) => listing.ownerUserId === id)
      .length,
    transportJobCount: jobs.filter((job) => job.ownerUserId === id).length,
    rentalCount: rentals.filter((rental) => rental.renterUserId === id).length,
  }))
}
