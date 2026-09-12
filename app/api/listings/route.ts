import { categories } from '@/lib/data'
import { searchListings } from '@/lib/server/listings'

export function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const category = query.get('category') ?? 'すべて'
  const deal = query.get('deal') ?? 'all'

  if (
    query.getAll('category').length > 1 ||
    query.getAll('deal').length > 1 ||
    !categories.some((value) => value === category) ||
    (deal !== 'all' &&
      deal !== 'sale' &&
      deal !== 'rent' &&
      deal !== 'rentToOwn')
  ) {
    return Response.json({ error: '検索条件が不正です。' }, { status: 400 })
  }

  return Response.json(searchListings({ category, deal }))
}
