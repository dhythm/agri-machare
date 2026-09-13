import { describe, expect, it } from 'vitest'
import { validateOrderRequest, validateOrderStatus } from './order'

describe('order validation', () => {
  it('accepts an optional message and known statuses', () => {
    expect(validateOrderRequest({ message: ' 現金で ' })).toEqual({
      ok: true,
      value: { message: '現金で' },
    })
    expect(validateOrderRequest({})).toEqual({ ok: true, value: {} })
    expect(validateOrderStatus({ status: 'accepted' })).toEqual({
      ok: true,
      value: { status: 'accepted' },
    })
    expect(validateOrderStatus({ status: 'paid' }).ok).toBe(false)
  })
})
