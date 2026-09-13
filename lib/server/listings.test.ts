import { describe, expect, it, vi } from 'vitest'
import {
  getFeaturedListings,
  getListing,
  getListingIds,
  paginateListings,
  searchListings,
} from './listings'

vi.mock('server-only', () => ({}))

describe('listing search', () => {
  it('returns every listing by default and keeps ids unique', () => {
    const ids = getListingIds()
    expect(searchListings().map((listing) => listing.id)).toEqual(ids)
    expect(ids.length).toBeGreaterThanOrEqual(40)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.slice(0, 6)).toEqual([
      'trc-001',
      'cmb-002',
      'rpl-003',
      'til-004',
      'drn-005',
      'trc-006',
    ])
  })

  it('combines category and deal filters', () => {
    const result = searchListings({ category: 'トラクター', deal: 'rent' })
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBe('trc-001')
    expect(
      result.every(
        (listing) =>
          listing.category === 'トラクター' && listing.deals.includes('rent'),
      ),
    ).toBe(true)
  })

  it('limits rent-to-own search to eligible listings', () => {
    const result = searchListings({ category: 'すべて', deal: 'rentToOwn' })
    expect(result.map((listing) => listing.id).slice(0, 3)).toEqual([
      'trc-001',
      'cmb-002',
      'rpl-003',
    ])
    expect(result.every((listing) => listing.rentToOwn === true)).toBe(true)
  })

  it('matches keywords against name, maker, category, location, and tags', () => {
    const byMaker = searchListings({
      category: 'すべて',
      deal: 'all',
      keyword: 'クボタ',
    })
    expect(byMaker.length).toBeGreaterThan(0)
    expect(byMaker.every((listing) => listing.maker === 'クボタ')).toBe(true)

    expect(
      searchListings({ category: 'すべて', deal: 'all', keyword: '長岡' }).map(
        (listing) => listing.id,
      ),
    ).toContain('trc-001')
    expect(
      searchListings({ category: 'すべて', deal: 'all', keyword: '4WD' }).map(
        (listing) => listing.id,
      ),
    ).toContain('trc-001')
  })

  it('treats blank keywords as no filter and splits on whitespace', () => {
    expect(
      searchListings({ category: 'すべて', deal: 'all', keyword: '  ' }),
    ).toHaveLength(getListingIds().length)
    const result = searchListings({
      category: 'すべて',
      deal: 'all',
      keyword: 'クボタ　新潟県',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every(
        (listing) =>
          listing.maker === 'クボタ' && listing.prefecture === '新潟県',
      ),
    ).toBe(true)
    expect(
      searchListings({
        category: 'すべて',
        deal: 'all',
        keyword: '存在しないキーワード',
      }),
    ).toEqual([])
  })

  it('finds a listing and handles an unknown id', () => {
    expect(getListing('drn-005')?.name).toContain('ドローン')
    expect(getListing('missing')).toBeUndefined()
  })
})

describe('listing pagination', () => {
  const filter = { category: 'すべて', deal: 'all' } as const

  it('returns one page with totals', () => {
    const total = getListingIds().length
    const page = paginateListings(filter, { page: 1, pageSize: 12 })
    expect(page.items).toHaveLength(12)
    expect(page).toMatchObject({
      total,
      page: 1,
      pageSize: 12,
      pageCount: Math.ceil(total / 12),
    })
    expect(page.items[0].id).toBe('trc-001')
  })

  it('returns the remainder on the last page and nothing beyond it', () => {
    const total = getListingIds().length
    const last = paginateListings(filter, { page: 1000, pageSize: 12 })
    expect(last.items).toEqual([])
    expect(last.total).toBe(total)
    const lastPage = paginateListings(filter, {
      page: Math.ceil(total / 12),
      pageSize: 12,
    })
    expect(lastPage.items.length).toBe(total - 12 * (lastPage.pageCount - 1))
  })

  it('reports an empty page for a filter with no matches', () => {
    expect(
      paginateListings(
        { ...filter, keyword: '存在しないキーワード' },
        { page: 1, pageSize: 12 },
      ),
    ).toEqual({ items: [], total: 0, page: 1, pageSize: 12, pageCount: 0 })
  })
})

describe('featured listings', () => {
  it('returns the first listings up to the limit', () => {
    const featured = getFeaturedListings(6)
    expect(featured).toHaveLength(6)
    expect(featured[0].id).toBe('trc-001')
  })
})
