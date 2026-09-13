import 'server-only'

import { randomUUID } from 'node:crypto'
import type { Listing } from '@/lib/data'
import type { ReviewInput } from '@/lib/validation/review'
import type { AuthenticatedUser } from './auth/accounts'
import { getStore, type Review, type ReviewSourceKind } from './store'

export type ReviewResult<T> =
  | { ok: true; value: T }
  | {
      ok: false
      reason: 'not_found' | 'forbidden' | 'not_reviewable' | 'duplicate'
    }

const fail = (reason: Extract<ReviewResult<never>, { ok: false }>['reason']) =>
  ({ ok: false, reason }) as const

type Source = { listingId: string; reviewerUserId: string; reviewable: boolean }

async function resolveSource(
  kind: ReviewSourceKind,
  id: string,
): Promise<Source | undefined> {
  const store = getStore()
  if (kind === 'rental') {
    const rental = await store.rentals.get(id)
    if (!rental) return undefined
    return {
      listingId: rental.listingId,
      reviewerUserId: rental.renterUserId,
      reviewable:
        rental.status === 'completed' || rental.status === 'converted',
    }
  }
  const submission = await store.submissions.get(id)
  if (
    !submission ||
    submission.kind !== 'listingInquiry' ||
    !submission.targetId ||
    !submission.userId
  )
    return undefined
  return {
    listingId: submission.targetId,
    reviewerUserId: submission.userId,
    reviewable: submission.status === 'agreed',
  }
}

export async function findReviewForSource(
  kind: ReviewSourceKind,
  id: string,
): Promise<Review | undefined> {
  const reviews = await getStore().reviews.list()
  return reviews.find(
    (review) => review.sourceKind === kind && review.sourceId === id,
  )
}

/** Weighted average over the seller's existing count, one decimal like the seed. */
function nextRating(
  seller: Listing['seller'],
  rating: number,
): Listing['seller'] {
  const reviews = seller.reviews + 1
  const total = seller.rating * seller.reviews + rating
  return { ...seller, reviews, rating: Math.round((total / reviews) * 10) / 10 }
}

export async function createReview(
  user: AuthenticatedUser,
  input: ReviewInput,
): Promise<ReviewResult<Review>> {
  const store = getStore()
  const source = await resolveSource(input.sourceKind, input.sourceId)
  if (!source) return fail('not_found')
  if (source.reviewerUserId !== user.id) return fail('forbidden')
  if (!source.reviewable) return fail('not_reviewable')
  const listing = await store.listings.get(source.listingId)
  if (!listing?.ownerUserId) return fail('not_found')
  if (await findReviewForSource(input.sourceKind, input.sourceId))
    return fail('duplicate')
  const review = await store.reviews.create({
    id: randomUUID(),
    listingId: listing.id,
    sellerUserId: listing.ownerUserId,
    reviewerUserId: user.id,
    sourceKind: input.sourceKind,
    sourceId: input.sourceId,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  })
  const owned = (await store.listings.list()).filter(
    (candidate) => candidate.ownerUserId === listing.ownerUserId,
  )
  await Promise.all(
    owned.map((candidate) =>
      store.listings.update(candidate.id, {
        seller: nextRating(candidate.seller, input.rating),
      }),
    ),
  )
  return { ok: true, value: review }
}

/** Newest first, as the store lists them. */
export async function listReviewsForSeller(
  sellerUserId: string,
): Promise<Review[]> {
  const reviews = await getStore().reviews.list()
  return reviews.filter((review) => review.sellerUserId === sellerUserId)
}

/** Rentals and threads of the user that are finished but not yet reviewed. */
export async function reviewableSources(
  user: AuthenticatedUser,
): Promise<{ rentals: string[]; threads: string[] }> {
  const store = getStore()
  const [rentals, submissions, reviews] = await Promise.all([
    store.rentals.list(),
    store.submissions.list(),
    store.reviews.list(),
  ])
  const reviewed = new Set(
    reviews
      .filter((review) => review.reviewerUserId === user.id)
      .map((review) => `${review.sourceKind}:${review.sourceId}`),
  )
  return {
    rentals: rentals
      .filter(
        (rental) =>
          rental.renterUserId === user.id &&
          (rental.status === 'completed' || rental.status === 'converted') &&
          !reviewed.has(`rental:${rental.id}`),
      )
      .map((rental) => rental.id),
    threads: submissions
      .filter(
        (submission) =>
          submission.kind === 'listingInquiry' &&
          submission.userId === user.id &&
          submission.status === 'agreed' &&
          !reviewed.has(`thread:${submission.id}`),
      )
      .map((submission) => submission.id),
  }
}
