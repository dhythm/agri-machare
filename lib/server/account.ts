import 'server-only'

import type { Listing, TransportJob } from '@/lib/data'
import { getStore, type Submission } from './store'

export type AccountOverview = {
  listings: { listing: Listing; inquiries: Submission[] }[]
  transportJobs: { job: TransportJob; applications: Submission[] }[]
  sentInquiries: { submission: Submission; listing?: Listing }[]
  sentApplications: { submission: Submission; job?: TransportJob }[]
}

/**
 * The store lists newest first; reverse before the stable sort so rows that
 * share a timestamp keep their insertion order.
 */
function oldestFirst(submissions: Submission[]): Submission[] {
  return [...submissions]
    .reverse()
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
}

/** Everything the user owns or sent, with what other people sent in return. */
export async function getAccountOverview(
  userId: string,
): Promise<AccountOverview> {
  const store = getStore()
  const [listings, jobs, submissions] = await Promise.all([
    store.listings.list(),
    store.transportJobs.list(),
    store.submissions.list(),
  ])
  const listingById = new Map(listings.map((listing) => [listing.id, listing]))
  const jobById = new Map(jobs.map((job) => [job.id, job]))
  const sent = submissions.filter((submission) => submission.userId === userId)

  return {
    listings: listings
      .filter((listing) => listing.ownerUserId === userId)
      .map((listing) => ({
        listing,
        inquiries: oldestFirst(
          submissions.filter(
            (submission) =>
              submission.kind === 'listingInquiry' &&
              submission.targetId === listing.id,
          ),
        ),
      })),
    transportJobs: jobs
      .filter((job) => job.ownerUserId === userId)
      .map((job) => ({
        job,
        applications: oldestFirst(
          submissions.filter(
            (submission) =>
              submission.kind === 'transportApplication' &&
              submission.targetId === job.id,
          ),
        ),
      })),
    sentInquiries: sent
      .filter((submission) => submission.kind === 'listingInquiry')
      .map((submission) => ({
        submission,
        listing: submission.targetId
          ? listingById.get(submission.targetId)
          : undefined,
      })),
    sentApplications: sent
      .filter((submission) => submission.kind === 'transportApplication')
      .map((submission) => ({
        submission,
        job: submission.targetId ? jobById.get(submission.targetId) : undefined,
      })),
  }
}
