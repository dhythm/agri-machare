/** Rent-to-own arithmetic shared by the listing page, forms, and services. */

export type RentToOwnTerms = {
  rentPerDay: number
  salePrice: number
  /** Share of paid rent credited against the price, in percent (1-100). */
  creditRate: number
  /** Optional cap on the credited amount, in yen. */
  creditCap?: number
}

export type RentToOwnEstimate = {
  days: number
  rentTotal: number
  credit: number
  purchasePrice: number
}

export function calculateRentToOwn(
  terms: RentToOwnTerms,
  days: number,
): RentToOwnEstimate {
  const rentTotal = terms.rentPerDay * days
  const share = Math.floor((rentTotal * terms.creditRate) / 100)
  const capped =
    terms.creditCap === undefined ? share : Math.min(share, terms.creditCap)
  const credit = Math.min(capped, terms.salePrice)
  return { days, rentTotal, credit, purchasePrice: terms.salePrice - credit }
}

const dayMs = 24 * 60 * 60 * 1000

/** Inclusive day count for ISO dates; 0 when the range is reversed. */
export function countRentalDays(startDate: string, endDate: string): number {
  const start = Date.parse(startDate)
  const end = Date.parse(endDate)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0
  return Math.round((end - start) / dayMs) + 1
}

export type DateRange = { startDate: string; endDate: string }

/** Inclusive ranges overlap when neither ends before the other starts. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

export const rentalStatuses = [
  'requested',
  'active',
  'converted',
  'completed',
  'cancelled',
] as const

export type RentalStatus = (typeof rentalStatuses)[number]

export const rentalStatusLabels: Record<RentalStatus, string> = {
  requested: '申込中',
  active: 'レンタル中',
  converted: '購入に切替',
  completed: '返却済み',
  cancelled: 'キャンセル',
}
