import { describe, expect, it, vi } from 'vitest'
import { getListing, getListingIds, searchListings } from './listings'

vi.mock('server-only', () => ({}))

describe('listing search', () => {
  it('returns every listing by default', () => {
    expect(searchListings().map((listing) => listing.id)).toEqual(
      getListingIds(),
    )
    expect(getListingIds()).toHaveLength(6)
  })

  it('combines category and deal filters', () => {
    expect(
      searchListings({ category: 'トラクター', deal: 'rent' }).map(
        (listing) => listing.id,
      ),
    ).toEqual(['trc-001'])
    expect(searchListings({ category: 'ドローン', deal: 'sale' })).toEqual([])
  })

  it('limits rent-to-own search to eligible listings', () => {
    expect(
      searchListings({ category: 'すべて', deal: 'rentToOwn' }).map(
        (listing) => listing.id,
      ),
    ).toEqual(['trc-001', 'cmb-002', 'rpl-003'])
  })

  it('finds a listing and handles an unknown id', () => {
    expect(getListing('drn-005')?.name).toContain('ドローン')
    expect(getListing('missing')).toBeUndefined()
  })
})
