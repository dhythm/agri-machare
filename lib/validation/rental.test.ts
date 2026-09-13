import { describe, expect, it } from 'vitest'
import { validateRentalRequest, validateRentalStatus } from './rental'

describe('validateRentalRequest', () => {
  it('requires two dates', () => {
    expect(
      validateRentalRequest({ startDate: '2026-10-01', endDate: '2026-10-07' }),
    ).toEqual({
      ok: true,
      value: { startDate: '2026-10-01', endDate: '2026-10-07' },
    })
    expect(validateRentalRequest({ startDate: '', endDate: 'x' }).ok).toBe(
      false,
    )
  })
})

describe('validateRentalStatus', () => {
  it('accepts only known statuses', () => {
    expect(validateRentalStatus({ status: 'active' })).toEqual({
      ok: true,
      value: { status: 'active' },
    })
    expect(validateRentalStatus({ status: 'paid' }).ok).toBe(false)
  })
})
