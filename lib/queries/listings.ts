import { queryOptions } from '@tanstack/react-query'
import type { Listing, ListingFilter } from '@/lib/data'

export function listingQueryOptions(filter: ListingFilter) {
  return queryOptions({
    queryKey: ['listings', filter],
    queryFn: async ({ signal }): Promise<Listing[]> => {
      const parameter = new URLSearchParams({
        category: filter.category,
        deal: filter.deal,
      })
      const response = await fetch(`/api/listings?${parameter}`, { signal })
      if (!response.ok) {
        throw new Error('農機具を取得できませんでした。')
      }
      return response.json()
    },
    staleTime: 60_000,
  })
}
