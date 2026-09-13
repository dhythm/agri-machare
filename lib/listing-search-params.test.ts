import { describe, expect, it } from 'vitest'
import {
  buildListingSearchParams,
  parseListingSearchParams,
} from './listing-search-params'

describe('parseListingSearchParams', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(parseListingSearchParams({})).toEqual({
      filter: { category: 'すべて', deal: 'all', keyword: '' },
      page: 1,
    })
    expect(
      parseListingSearchParams({
        category: '不明',
        deal: 'buy',
        page: '0',
        q: ['a', 'b'],
      }),
    ).toEqual({
      filter: { category: 'すべて', deal: 'all', keyword: '' },
      page: 1,
    })
  })

  it('reads valid values and trims keywords', () => {
    expect(
      parseListingSearchParams({
        category: 'ドローン',
        deal: 'rent',
        page: '3',
        q: ' DJI ',
      }),
    ).toEqual({
      filter: { category: 'ドローン', deal: 'rent', keyword: 'DJI' },
      page: 3,
    })
  })

  it('accepts URLSearchParams', () => {
    expect(
      parseListingSearchParams(new URLSearchParams('deal=sale&page=2')),
    ).toEqual({
      filter: { category: 'すべて', deal: 'sale', keyword: '' },
      page: 2,
    })
  })
})

describe('buildListingSearchParams', () => {
  it('omits default values so URLs stay short', () => {
    expect(
      buildListingSearchParams(
        { category: 'すべて', deal: 'all', keyword: '' },
        1,
      ),
    ).toBe('')
    expect(
      buildListingSearchParams(
        { category: 'ドローン', deal: 'rent', keyword: 'DJI' },
        3,
      ),
    ).toBe(
      'q=DJI&category=%E3%83%89%E3%83%AD%E3%83%BC%E3%83%B3&deal=rent&page=3',
    )
  })
})
