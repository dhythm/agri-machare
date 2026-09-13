import { categories } from '@/lib/data'
import {
  asRecord,
  finish,
  invalidInput,
  readBoolean,
  readInteger,
  requireChoice,
  requireEmail,
  requireText,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export const listingCategories = categories.filter(
  (category) => category !== 'すべて',
)

export const listingConditions = [
  '未使用に近い',
  '目立った傷なし',
  '使用感あり',
  '要整備',
] as const

const listingDeals = ['sale', 'rent'] as const

export type ListingSubmission = {
  name: string
  category: (typeof listingCategories)[number]
  maker: string
  year: number
  hours: number
  condition: (typeof listingConditions)[number]
  prefecture: string
  city: string
  deals: (typeof listingDeals)[number][]
  salePrice?: number
  rentPerDay?: number
  rentToOwn: boolean
  summary: string
  contactEmail: string
}

function readDeals(
  errors: FieldErrors,
  source: Record<string, unknown>,
): ListingSubmission['deals'] {
  const raw = source.deals
  const values = Array.isArray(raw) ? raw : []
  const deals = listingDeals.filter((deal) => values.includes(deal))
  if (deals.length === 0) errors.deals = '取引方法を1つ以上選択してください。'
  return deals
}

export function validateListingSubmission(
  input: unknown,
): ValidationResult<ListingSubmission> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}

  const deals = readDeals(errors, source)
  const canSell = deals.includes('sale')
  const canRent = deals.includes('rent')
  const rentToOwn = readBoolean(source, 'rentToOwn')
  if (rentToOwn && deals.length > 0 && !(canSell && canRent))
    errors.rentToOwn = 'レンタル購入には販売とレンタルの両方が必要です。'

  const value: ListingSubmission = {
    name: requireText(errors, source, 'name', '農機具名', 80),
    category: requireChoice(
      errors,
      source,
      'category',
      'カテゴリ',
      listingCategories,
    ) as ListingSubmission['category'],
    maker: requireText(errors, source, 'maker', 'メーカー', 40),
    year: readInteger(errors, source, 'year', '年式', {
      min: 1980,
      max: 2030,
    }) as number,
    hours: readInteger(errors, source, 'hours', '稼働時間', {
      min: 0,
      max: 100_000,
    }) as number,
    condition: requireChoice(
      errors,
      source,
      'condition',
      '状態',
      listingConditions,
    ) as ListingSubmission['condition'],
    prefecture: requireText(errors, source, 'prefecture', '都道府県', 10),
    city: requireText(errors, source, 'city', '市区町村', 40),
    deals,
    salePrice: readInteger(
      errors,
      source,
      'salePrice',
      '販売価格',
      { min: 1, max: 1_000_000_000 },
      canSell,
    ),
    rentPerDay: readInteger(
      errors,
      source,
      'rentPerDay',
      'レンタル料（1日）',
      { min: 1, max: 10_000_000 },
      canRent,
    ),
    rentToOwn,
    summary: requireText(errors, source, 'summary', '説明', 1000),
    contactEmail: requireEmail(errors, source, 'contactEmail'),
  }
  if (!canSell) value.salePrice = undefined
  if (!canRent) value.rentPerDay = undefined

  return finish(errors, value)
}
