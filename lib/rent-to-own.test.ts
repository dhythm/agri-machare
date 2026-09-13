import { describe, expect, it } from 'vitest'
import {
  calculateRentToOwn,
  countRentalDays,
  rangesOverlap,
  rentalStatusLabels,
} from './rent-to-own'

describe('calculateRentToOwn', () => {
  const terms = { rentPerDay: 22_000, salePrice: 18_800_000, creditRate: 50 }

  it('credits a share of the rent against the price', () => {
    expect(calculateRentToOwn(terms, 30)).toEqual({
      days: 30,
      rentTotal: 660_000,
      credit: 330_000,
      purchasePrice: 18_470_000,
    })
  })

  it('caps the credit', () => {
    expect(
      calculateRentToOwn({ ...terms, creditCap: 100_000 }, 30).credit,
    ).toBe(100_000)
    expect(
      calculateRentToOwn({ ...terms, creditCap: 100_000 }, 30).purchasePrice,
    ).toBe(18_700_000)
  })

  it('never credits more than the price and rounds down to yen', () => {
    expect(
      calculateRentToOwn({ rentPerDay: 3, salePrice: 10, creditRate: 33 }, 1)
        .credit,
    ).toBe(0)
    expect(
      calculateRentToOwn(
        { rentPerDay: 1_000_000, salePrice: 10, creditRate: 100 },
        1,
      ),
    ).toEqual({ days: 1, rentTotal: 1_000_000, credit: 10, purchasePrice: 0 })
  })
})

describe('countRentalDays', () => {
  it('counts both ends and rejects reversed ranges', () => {
    expect(countRentalDays('2026-10-01', '2026-10-01')).toBe(1)
    expect(countRentalDays('2026-10-01', '2026-10-07')).toBe(7)
    expect(countRentalDays('2026-10-07', '2026-10-01')).toBe(0)
  })
})

describe('rangesOverlap', () => {
  it('treats touching days as overlapping (inclusive ranges)', () => {
    const a = { startDate: '2026-10-01', endDate: '2026-10-07' }
    expect(
      rangesOverlap(a, { startDate: '2026-10-07', endDate: '2026-10-09' }),
    ).toBe(true)
    expect(
      rangesOverlap(a, { startDate: '2026-10-08', endDate: '2026-10-09' }),
    ).toBe(false)
    expect(
      rangesOverlap(a, { startDate: '2026-09-20', endDate: '2026-10-01' }),
    ).toBe(true)
    expect(
      rangesOverlap(a, { startDate: '2026-09-20', endDate: '2026-09-30' }),
    ).toBe(false)
  })
})

describe('rentalStatusLabels', () => {
  it('has a label for every status', () => {
    expect(rentalStatusLabels.requested).toBe('申込中')
    expect(rentalStatusLabels.converted).toBe('購入に切替')
  })
})
