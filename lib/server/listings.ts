import 'server-only'

import type { Listing, ListingFilter } from '@/lib/data'
import { listings } from './data'

export function searchListings(
  filter: ListingFilter = { category: 'すべて', deal: 'all' },
): Listing[] {
  return listings.filter((listing) => {
    if (filter.category !== 'すべて' && listing.category !== filter.category)
      return false
    if (filter.deal === 'rentToOwn') return listing.rentToOwn === true
    return filter.deal === 'all' || listing.deals.includes(filter.deal)
  })
}

export function getListing(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id)
}

export function getListingIds(): string[] {
  return listings.map((listing) => listing.id)
}
