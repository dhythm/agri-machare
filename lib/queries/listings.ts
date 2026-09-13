import { queryOptions } from '@tanstack/react-query'
import type { ListingFilter, ListingPage, PageRequest } from '@/lib/data'

export function listingQueryOptions(filter: ListingFilter, page: PageRequest) {
  const keyword = filter.keyword?.trim() ?? ''
  return queryOptions({
    queryKey: ['listings', { ...filter, keyword }, page],
    queryFn: async ({ signal }): Promise<ListingPage> => {
      const parameter = new URLSearchParams({
        category: filter.category,
        deal: filter.deal,
        page: String(page.page),
        pageSize: String(page.pageSize),
      })
      if (keyword) parameter.set('q', keyword)
      const response = await fetch(`/api/listings?${parameter}`, { signal })
      if (!response.ok) {
        throw new Error('農機具を取得できませんでした。')
      }
      return response.json()
    },
    staleTime: 60_000,
  })
}
