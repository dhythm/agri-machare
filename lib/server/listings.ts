import 'server-only'

import { randomUUID } from 'node:crypto'
import { isApproved } from '@/lib/data'
import type {
  Listing,
  ListingFilter,
  ListingPage,
  PageRequest,
} from '@/lib/data'
import type { ListingSubmission } from '@/lib/validation/listing-submission'
import { getStore } from './store'
import { deleteSubmissionsFor } from './submissions'

const imageByCategory: Record<string, string> = {
  トラクター: '/equipment/tractor.png',
  コンバイン: '/equipment/combine.png',
  田植機: '/equipment/rice-planter.png',
  耕運機: '/equipment/tiller.png',
  ドローン: '/equipment/drone.png',
}

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase()
}

function keywordTerms(keyword: string | undefined): string[] {
  if (!keyword) return []
  return normalize(keyword)
    .split(/\s+/)
    .filter((term) => term.length > 0)
}

function searchableText(listing: Listing): string {
  return normalize(
    [
      listing.name,
      listing.maker,
      listing.category,
      listing.prefecture,
      listing.city,
      listing.condition,
      listing.seller.name,
      ...listing.tags,
    ].join(' '),
  )
}

function matches(listing: Listing, filter: ListingFilter, terms: string[]) {
  if (filter.category !== 'すべて' && listing.category !== filter.category)
    return false
  if (filter.deal === 'rentToOwn' && listing.rentToOwn !== true) return false
  if (
    filter.deal !== 'all' &&
    filter.deal !== 'rentToOwn' &&
    !listing.deals.includes(filter.deal)
  )
    return false
  if (terms.length === 0) return true
  const text = searchableText(listing)
  return terms.every((term) => text.includes(term))
}

export async function searchListings(
  filter: ListingFilter = { category: 'すべて', deal: 'all' },
): Promise<Listing[]> {
  const terms = keywordTerms(filter.keyword)
  const listings = await getStore().listings.list()
  return listings.filter(
    (listing) => isApproved(listing) && matches(listing, filter, terms),
  )
}

export async function paginateListings(
  filter: ListingFilter,
  request: PageRequest,
): Promise<ListingPage> {
  const matched = await searchListings(filter)
  const pageSize = Math.max(1, Math.floor(request.pageSize))
  const page = Math.max(1, Math.floor(request.page))
  const start = (page - 1) * pageSize
  return {
    items: matched.slice(start, start + pageSize),
    total: matched.length,
    page,
    pageSize,
    pageCount: Math.ceil(matched.length / pageSize),
  }
}

export async function getFeaturedListings(limit: number): Promise<Listing[]> {
  return (await getStore().listings.list()).filter(isApproved).slice(0, limit)
}

export function getListing(id: string): Promise<Listing | undefined> {
  return getStore().listings.get(id)
}

export async function getRelatedListings(
  listing: Listing,
  limit: number,
): Promise<Listing[]> {
  const listings = await getStore().listings.list()
  return listings
    .filter(
      (candidate) =>
        candidate.id !== listing.id &&
        candidate.category === listing.category &&
        isApproved(candidate),
    )
    .slice(0, limit)
}

export async function getListingIds(): Promise<string[]> {
  return (await getStore().listings.list())
    .filter(isApproved)
    .map((listing) => listing.id)
}

/** Public listing fields derived from a submission; contact details stay out. */
function listingFields(submission: ListingSubmission) {
  return {
    name: submission.name,
    category: submission.category,
    maker: submission.maker,
    year: submission.year,
    hours: submission.hours,
    condition: submission.condition,
    prefecture: submission.prefecture,
    city: submission.city,
    image: imageByCategory[submission.category] ?? '/placeholder.svg',
    summary: submission.summary,
    deals: submission.deals,
    salePrice: submission.salePrice,
    rentPerDay: submission.rentPerDay,
    rentToOwn: submission.rentToOwn,
    tags: [] as string[],
  }
}

export function createListing(submission: ListingSubmission): Promise<Listing> {
  const now = new Date().toISOString()
  return getStore().listings.create({
    id: randomUUID(),
    ...listingFields(submission),
    seller: {
      name: submission.sellerName,
      kind: submission.sellerKind,
      rating: 0,
      reviews: 0,
    },
    createdAt: now,
    updatedAt: now,
    moderationStatus: 'pending',
  })
}

export async function updateListing(
  id: string,
  submission: ListingSubmission,
): Promise<Listing | undefined> {
  const current = await getStore().listings.get(id)
  if (!current) return undefined
  return getStore().listings.update(id, {
    ...listingFields(submission),
    tags: current.tags,
    seller: {
      ...current.seller,
      name: submission.sellerName,
      kind: submission.sellerKind,
    },
    updatedAt: new Date(Date.now() + 1).toISOString(),
  })
}

export async function deleteListing(id: string): Promise<boolean> {
  const deleted = await getStore().listings.delete(id)
  if (deleted) await deleteSubmissionsFor(id)
  return deleted
}
