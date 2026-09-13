import { describe, expect, it } from 'vitest'
import { validateListingSubmission } from './listing-submission'

const valid = {
  name: 'クボタ トラクター 30馬力',
  category: 'トラクター',
  maker: 'クボタ',
  year: '2018',
  hours: '500',
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  deals: ['sale', 'rent'],
  salePrice: '1500000',
  rentPerDay: '12000',
  rentToOwn: true,
  rentToOwnCreditRate: '50',
  rentToOwnCreditCap: '300000',
  summary: 'キャビン付き。まず借りて試せます。',
  sellerName: '中村ファーム',
  sellerKind: '農業法人',
  contactEmail: 'seller@example.com',
}

describe('validateListingSubmission', () => {
  it('accepts a complete submission and normalizes numbers', () => {
    const result = validateListingSubmission(valid)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      year: 2018,
      hours: 500,
      salePrice: 1_500_000,
      rentPerDay: 12_000,
      rentToOwn: true,
      rentToOwnCreditRate: 50,
      rentToOwnCreditCap: 300_000,
      deals: ['sale', 'rent'],
    })
  })

  it('requires the credit rate only for rent-to-own and clears it otherwise', () => {
    const missingRate = validateListingSubmission({
      ...valid,
      rentToOwnCreditRate: '',
    })
    expect(missingRate.ok).toBe(false)
    if (!missingRate.ok)
      expect(missingRate.errors).toHaveProperty('rentToOwnCreditRate')

    const tooHigh = validateListingSubmission({
      ...valid,
      rentToOwnCreditRate: '120',
    })
    expect(tooHigh.ok).toBe(false)

    const noCap = validateListingSubmission({
      ...valid,
      rentToOwnCreditCap: '',
    })
    expect(noCap.ok).toBe(true)
    if (noCap.ok) expect(noCap.value.rentToOwnCreditCap).toBeUndefined()

    const plain = validateListingSubmission({ ...valid, rentToOwn: false })
    expect(plain.ok).toBe(true)
    if (plain.ok) {
      expect(plain.value.rentToOwnCreditRate).toBeUndefined()
      expect(plain.value.rentToOwnCreditCap).toBeUndefined()
    }
  })

  it('requires prices for the selected deals only', () => {
    const rentOnly = validateListingSubmission({
      ...valid,
      deals: ['rent'],
      salePrice: '',
      rentToOwn: false,
    })
    expect(rentOnly.ok).toBe(true)
    if (rentOnly.ok) expect(rentOnly.value.salePrice).toBeUndefined()

    const missingRent = validateListingSubmission({
      ...valid,
      deals: ['rent'],
      rentPerDay: '',
    })
    expect(missingRent.ok).toBe(false)
    if (!missingRent.ok) expect(missingRent.errors).toHaveProperty('rentPerDay')
  })

  it('reports every invalid field', () => {
    const result = validateListingSubmission({
      ...valid,
      name: '',
      category: '不明',
      year: '1800',
      deals: [],
      sellerName: '',
      sellerKind: '団体',
      contactEmail: 'not-an-email',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual([
      'category',
      'contactEmail',
      'deals',
      'name',
      'sellerKind',
      'sellerName',
      'year',
    ])
  })

  it('rejects rent-to-own without both deals', () => {
    const result = validateListingSubmission({
      ...valid,
      deals: ['sale'],
      rentToOwn: true,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toHaveProperty('rentToOwn')
  })

  it('rejects non-object input', () => {
    expect(validateListingSubmission(null).ok).toBe(false)
    expect(validateListingSubmission('text').ok).toBe(false)
  })
})
