import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createListing,
  deleteListing,
  getFeaturedListings,
  getListing,
  getListingIds,
  paginateListings,
  searchListings,
  updateListing,
} from './listings'
import { resetStore } from './store'
import type { ListingSubmission } from '@/lib/validation/listing-submission'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const submission: ListingSubmission = {
  name: 'クボタ トラクター 30馬力 テスト',
  category: 'トラクター',
  maker: 'クボタ',
  year: 2018,
  hours: 500,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  deals: ['sale', 'rent'],
  salePrice: 1_500_000,
  rentPerDay: 12_000,
  rentToOwn: true,
  summary: 'キャビン付き。',
  sellerName: 'テスト農園',
  sellerKind: '農業法人',
  contactEmail: 'seller@example.com',
}

describe('listing search', () => {
  it('returns every listing by default and keeps ids unique', async () => {
    const ids = await getListingIds()
    expect((await searchListings()).map((listing) => listing.id)).toEqual(ids)
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

  it('combines category and deal filters', async () => {
    const result = await searchListings({
      category: 'トラクター',
      deal: 'rent',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBe('trc-001')
    expect(
      result.every(
        (listing) =>
          listing.category === 'トラクター' && listing.deals.includes('rent'),
      ),
    ).toBe(true)
  })

  it('limits rent-to-own search to eligible listings', async () => {
    const result = await searchListings({
      category: 'すべて',
      deal: 'rentToOwn',
    })
    expect(result.map((listing) => listing.id).slice(0, 3)).toEqual([
      'trc-001',
      'cmb-002',
      'rpl-003',
    ])
    expect(result.every((listing) => listing.rentToOwn === true)).toBe(true)
  })

  it('matches keywords against name, maker, category, location, and tags', async () => {
    const byMaker = await searchListings({
      category: 'すべて',
      deal: 'all',
      keyword: 'クボタ',
    })
    expect(byMaker.length).toBeGreaterThan(0)
    expect(byMaker.every((listing) => listing.maker === 'クボタ')).toBe(true)

    expect(
      (
        await searchListings({
          category: 'すべて',
          deal: 'all',
          keyword: '長岡',
        })
      ).map((listing) => listing.id),
    ).toContain('trc-001')
    expect(
      (
        await searchListings({
          category: 'すべて',
          deal: 'all',
          keyword: '4WD',
        })
      ).map((listing) => listing.id),
    ).toContain('trc-001')
  })

  it('treats blank keywords as no filter and splits on whitespace', async () => {
    expect(
      await searchListings({ category: 'すべて', deal: 'all', keyword: '  ' }),
    ).toHaveLength((await getListingIds()).length)
    const result = await searchListings({
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
      await searchListings({
        category: 'すべて',
        deal: 'all',
        keyword: '存在しないキーワード',
      }),
    ).toEqual([])
  })

  it('finds a listing and handles an unknown id', async () => {
    expect((await getListing('drn-005'))?.name).toContain('ドローン')
    expect(await getListing('missing')).toBeUndefined()
  })
})

describe('listing pagination', () => {
  const filter = { category: 'すべて', deal: 'all' } as const

  it('returns one page with totals', async () => {
    const total = (await getListingIds()).length
    const page = await paginateListings(filter, { page: 1, pageSize: 12 })
    expect(page.items).toHaveLength(12)
    expect(page).toMatchObject({
      total,
      page: 1,
      pageSize: 12,
      pageCount: Math.ceil(total / 12),
    })
    expect(page.items[0].id).toBe('trc-001')
  })

  it('returns the remainder on the last page and nothing beyond it', async () => {
    const total = (await getListingIds()).length
    const last = await paginateListings(filter, { page: 1000, pageSize: 12 })
    expect(last.items).toEqual([])
    expect(last.total).toBe(total)
    const lastPage = await paginateListings(filter, {
      page: Math.ceil(total / 12),
      pageSize: 12,
    })
    expect(lastPage.items.length).toBe(total - 12 * (lastPage.pageCount - 1))
  })

  it('reports an empty page for a filter with no matches', async () => {
    expect(
      await paginateListings(
        { ...filter, keyword: '存在しないキーワード' },
        { page: 1, pageSize: 12 },
      ),
    ).toEqual({ items: [], total: 0, page: 1, pageSize: 12, pageCount: 0 })
  })
})

describe('featured listings', () => {
  it('returns the first listings up to the limit', async () => {
    const featured = await getFeaturedListings(6)
    expect(featured).toHaveLength(6)
    expect(featured[0].id).toBe('trc-001')
  })
})

describe('listing CRUD', () => {
  it('creates a listing from a submission and lists it first', async () => {
    const created = await createListing(submission)
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created).toMatchObject({
      name: submission.name,
      image: '/equipment/tractor.png',
      seller: { name: 'テスト農園', kind: '農業法人', rating: 0, reviews: 0 },
      createdAt: expect.any(String),
    })
    expect((await getFeaturedListings(1))[0].id).toBe(created.id)
    expect((await getListing(created.id))?.name).toBe(submission.name)
    expect(
      (
        await searchListings({
          category: 'すべて',
          deal: 'all',
          keyword: 'テスト農園',
        })
      ).map((listing) => listing.id),
    ).toEqual([created.id])
  })

  it('does not store the contact email on the public listing', async () => {
    const created = await createListing(submission)
    expect(JSON.stringify(created)).not.toContain('seller@example.com')
  })

  it('updates an existing listing and keeps its id, seller rating, and history', async () => {
    const created = await createListing(submission)
    const updated = await updateListing(created.id, {
      ...submission,
      name: '更新後の名前',
      deals: ['rent'],
      salePrice: undefined,
      rentToOwn: false,
    })
    expect(updated).toMatchObject({
      id: created.id,
      name: '更新後の名前',
      deals: ['rent'],
      rentToOwn: false,
      seller: { rating: 0, reviews: 0 },
      createdAt: created.createdAt,
    })
    expect(updated?.salePrice).toBeUndefined()
    expect(updated?.updatedAt).not.toBe(created.updatedAt)
    expect(await updateListing('missing', submission)).toBeUndefined()
  })

  it('keeps a seeded seller rating when a seeded listing is updated', async () => {
    const updated = await updateListing('trc-001', submission)
    expect(updated?.seller).toMatchObject({
      name: 'テスト農園',
      rating: 4.8,
      reviews: 34,
    })
  })

  it('deletes a listing', async () => {
    expect(await deleteListing('trc-001')).toBe(true)
    expect(await getListing('trc-001')).toBeUndefined()
    expect(await deleteListing('trc-001')).toBe(false)
  })
})
