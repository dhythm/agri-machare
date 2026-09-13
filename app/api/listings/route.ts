import { isCategory, isDealFilter } from '@/lib/data'
import { badRequest, handleSubmission } from '@/lib/server/api'
import { paginateListings } from '@/lib/server/listings'
import { validateListingSubmission } from '@/lib/validation/listing-submission'

const defaultPageSize = 12
const maxPageSize = 48
const maxKeywordLength = 100

/** One value per key: `undefined` when absent, `null` when repeated. */
function readSingle(
  query: URLSearchParams,
  key: string,
): string | undefined | null {
  const values = query.getAll(key)
  if (values.length > 1) return null
  return values[0]
}

function readPositiveInteger(
  value: string,
  fallback: number,
  max: number,
): number | null {
  if (value === '') return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= 1 && parsed <= max ? parsed : null
}

export function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const category = readSingle(query, 'category')
  const deal = readSingle(query, 'deal')
  const keyword = readSingle(query, 'q')
  const pageValue = readSingle(query, 'page')
  const pageSizeValue = readSingle(query, 'pageSize')

  if (
    category === null ||
    deal === null ||
    keyword === null ||
    pageValue === null ||
    pageSizeValue === null
  )
    return badRequest('検索条件が重複しています。')

  const resolvedCategory = category ?? 'すべて'
  const resolvedDeal = deal ?? 'all'
  const resolvedKeyword = keyword ?? ''
  const page = readPositiveInteger(pageValue ?? '', 1, Number.MAX_SAFE_INTEGER)
  const pageSize = readPositiveInteger(
    pageSizeValue ?? '',
    defaultPageSize,
    maxPageSize,
  )

  if (
    !isCategory(resolvedCategory) ||
    !isDealFilter(resolvedDeal) ||
    resolvedKeyword.length > maxKeywordLength ||
    page === null ||
    pageSize === null
  )
    return badRequest('検索条件が不正です。')

  return Response.json(
    paginateListings(
      {
        category: resolvedCategory,
        deal: resolvedDeal,
        keyword: resolvedKeyword,
      },
      { page, pageSize },
    ),
  )
}

export function POST(request: Request) {
  return handleSubmission(request, 'listing', validateListingSubmission)
}
