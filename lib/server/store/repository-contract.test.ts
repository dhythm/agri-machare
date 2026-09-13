// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Listing, TransportJob } from '@/lib/data'
import { createMemoryStore } from './memory'
import { createPgliteStore } from './pglite'
import type { Store, Submission } from './types'

vi.mock('server-only', () => ({}))

const listing = (id: string, name: string): Listing => ({
  id,
  name,
  category: 'トラクター',
  maker: 'クボタ',
  year: 2019,
  hours: 620,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/equipment/tractor.png',
  summary: '説明',
  deals: ['sale', 'rent'],
  salePrice: 18_800_000,
  rentPerDay: 22_000,
  rentToOwn: true,
  seller: { name: '中村ファーム', kind: '農業法人', rating: 4.8, reviews: 34 },
  tags: ['キャビン付', '4WD'],
  createdAt: '2026-09-13T00:00:00.000Z',
  updatedAt: '2026-09-13T00:00:00.000Z',
})

const job = (id: string): TransportJob => ({
  id,
  item: 'コンバイン 4条刈',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  weight: '約2.4t',
  desiredDate: '9/28 午前',
  reward: 38_000,
  status: '募集中',
})

const submission = (id: string): Submission => ({
  id,
  kind: 'contact',
  targetId: undefined,
  receivedAt: '2026-09-13T01:02:03.000Z',
  payload: { message: 'hello', nested: { count: 2 }, list: ['a'] },
})

const stores: { name: string; store: Store }[] = [
  { name: 'memory', store: createMemoryStore() },
  { name: 'pglite', store: createPgliteStore({ dataDir: 'memory://' }) },
]

afterAll(async () => {
  for (const { store } of stores) await store.close()
})

describe.each(stores)('$name store', ({ store }) => {
  beforeEach(() => store.reset())

  it('is seeded with sample data in seed order', async () => {
    const listings = await store.listings.list()
    expect(listings.length).toBeGreaterThanOrEqual(48)
    expect(listings.slice(0, 3).map((item) => item.id)).toEqual([
      'trc-001',
      'cmb-002',
      'rpl-003',
    ])
    expect((await store.transportJobs.list())[0].id).toBe('tj-01')
    expect(await store.submissions.list()).toEqual([])
  })

  it('round-trips a listing with every field', async () => {
    const created = await store.listings.create(listing('new-1', '新規'))
    expect(created).toEqual(listing('new-1', '新規'))
    expect(await store.listings.get('new-1')).toEqual(listing('new-1', '新規'))
    expect((await store.listings.list())[0].id).toBe('new-1')
  })

  it('stores optional listing fields as absent', async () => {
    const minimal: Listing = {
      ...listing('new-2', '最小'),
      deals: ['rent'],
      salePrice: undefined,
      rentToOwn: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
    const created = await store.listings.create(minimal)
    expect(created.salePrice).toBeUndefined()
    expect('salePrice' in created).toBe(false)
    expect(created.createdAt).toBeUndefined()
  })

  it('updates in place, keeps the id, and ignores unknown ids', async () => {
    const updated = await store.listings.update('trc-001', {
      name: '更新',
      seller: { name: 'X', kind: '法人', rating: 1.5, reviews: 2 },
      tags: [],
    })
    expect(updated).toMatchObject({
      id: 'trc-001',
      name: '更新',
      seller: { name: 'X', rating: 1.5 },
      tags: [],
      maker: 'クボタ',
    })
    expect((await store.listings.get('trc-001'))?.name).toBe('更新')
    expect(
      await store.listings.update('missing', { name: 'x' }),
    ).toBeUndefined()
  })

  it('deletes and rejects duplicate ids', async () => {
    expect(await store.listings.delete('trc-001')).toBe(true)
    expect(await store.listings.delete('trc-001')).toBe(false)
    await expect(
      store.listings.create(listing('cmb-002', 'dup')),
    ).rejects.toThrow()
  })

  it('round-trips moderation fields', async () => {
    const created = await store.listings.create({
      ...listing('mod-1', '審査'),
      moderationStatus: 'pending',
    })
    expect(created.moderationStatus).toBe('pending')
    const decided = await store.listings.update('mod-1', {
      moderationStatus: 'rejected',
      moderationNote: '写真が不足',
      moderatedAt: '2026-09-13T02:00:00.000Z',
    })
    expect(decided).toMatchObject({
      moderationStatus: 'rejected',
      moderationNote: '写真が不足',
      moderatedAt: '2026-09-13T02:00:00.000Z',
    })
  })

  it('round-trips transport jobs and submissions', async () => {
    expect(await store.transportJobs.create(job('job-1'))).toEqual(job('job-1'))
    expect(
      await store.transportJobs.update('job-1', {
        status: '調整中',
        reward: 1,
      }),
    ).toMatchObject({ status: '調整中', reward: 1, item: 'コンバイン 4条刈' })

    await store.submissions.create(submission('s-1'))
    await store.submissions.create({
      ...submission('s-2'),
      kind: 'listingInquiry',
      targetId: 'trc-001',
    })
    const stored = await store.submissions.list()
    expect(stored.map((item) => item.id)).toEqual(['s-2', 's-1'])
    expect(stored[1]).toEqual(submission('s-1'))
    expect(stored[0].targetId).toBe('trc-001')
    expect(await store.submissions.delete('s-1')).toBe(true)
  })

  it('does not let callers mutate stored data through returned objects', async () => {
    const first = (await store.listings.get('trc-001'))!
    first.tags.push('hacked')
    expect((await store.listings.get('trc-001'))?.tags).not.toContain('hacked')
  })
})
