import { describe, expect, it } from 'vitest'
import { validateMessage, validateThreadStatus } from './thread'

describe('validateMessage', () => {
  it('requires a trimmed body up to 2000 characters', () => {
    expect(validateMessage({ body: ' 在庫ありますか ' })).toEqual({
      ok: true,
      value: { body: '在庫ありますか' },
    })
    expect(validateMessage({ body: '' }).ok).toBe(false)
    expect(validateMessage({ body: 'a'.repeat(2001) }).ok).toBe(false)
    expect(validateMessage(null).ok).toBe(false)
  })
})

describe('validateThreadStatus', () => {
  it('accepts only known statuses', () => {
    expect(validateThreadStatus({ status: 'agreed' })).toEqual({
      ok: true,
      value: { status: 'agreed' },
    })
    expect(validateThreadStatus({ status: 'done' }).ok).toBe(false)
  })
})
