import 'server-only'

import type {
  Listing,
  ListingFilter,
  ListingPage,
  PageRequest,
} from '@/lib/data'
import { listings } from './data'

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
      ...listing.tags,
    ].join(' '),
  )
}

export function searchListings(
  filter: ListingFilter = { category: 'すべて', deal: 'all' },
): Listing[] {
  const terms = keywordTerms(filter.keyword)
  return listings.filter((listing) => {
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
  })
}

export function paginateListings(
  filter: ListingFilter,
  request: PageRequest,
): ListingPage {
  const matched = searchListings(filter)
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

export function getFeaturedListings(limit: number): Listing[] {
  return listings.slice(0, limit)
}

export function getListing(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id)
}

export function getRelatedListings(listing: Listing, limit: number): Listing[] {
  return listings
    .filter(
      (candidate) =>
        candidate.id !== listing.id && candidate.category === listing.category,
    )
    .slice(0, limit)
}

export function getListingIds(): string[] {
  return listings.map((listing) => listing.id)
}
