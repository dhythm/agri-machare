import { isCategory, isDealFilter, type ListingFilter } from '@/lib/data'

export type ListingSearchState = {
  filter: Required<ListingFilter>
  page: number
}

type ParamSource =
  URLSearchParams | Record<string, string | string[] | undefined>

function readValue(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) {
    const values = source.getAll(key)
    return values.length === 1 ? values[0] : undefined
  }
  const value = source[key]
  return typeof value === 'string' ? value : undefined
}

export function parseListingSearchParams(
  source: ParamSource,
): ListingSearchState {
  const category = readValue(source, 'category') ?? ''
  const deal = readValue(source, 'deal') ?? ''
  const keyword = (readValue(source, 'q') ?? '').trim().slice(0, 100)
  const page = Number(readValue(source, 'page') ?? '1')
  return {
    filter: {
      category: isCategory(category) ? category : 'すべて',
      deal: isDealFilter(deal) ? deal : 'all',
      keyword,
    },
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

export function buildListingSearchParams(
  filter: Required<ListingFilter>,
  page: number,
): string {
  const parameter = new URLSearchParams()
  if (filter.keyword) parameter.set('q', filter.keyword)
  if (filter.category !== 'すべて') parameter.set('category', filter.category)
  if (filter.deal !== 'all') parameter.set('deal', filter.deal)
  if (page > 1) parameter.set('page', String(page))
  return parameter.toString()
}
