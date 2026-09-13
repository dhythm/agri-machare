import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'
import { POST as createListing } from '../../listings/route'
import { POST as createJob } from '../../transport/jobs/route'
import { adminSecretHeader } from '@/lib/server/admin'
import { resetStore } from '@/lib/server/store'

vi.mock('server-only', () => ({}))

beforeEach(() => {
  vi.stubEnv('ADMIN_SECRET', 'shared-key')
  return resetStore()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

const headers = { [adminSecretHeader]: 'shared-key' }

const listingBody = {
  name: '審査中トラクター',
  category: 'トラクター',
  maker: 'クボタ',
  year: '2018',
  hours: '500',
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  deals: ['sale'],
  salePrice: '1000000',
  rentPerDay: '',
  rentToOwn: false,
  summary: '審査中。',
  sellerName: '審査農園',
  sellerKind: '農業法人',
  contactEmail: 'seller@example.com',
}

function adminGet(url: string) {
  return GET(new Request(url, { headers }))
}

function adminPost(body: unknown) {
  return POST(
    new Request('http://localhost/api/admin/queue', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
  )
}

describe('/api/admin/queue', () => {
  it('requires the admin secret', async () => {
    expect(
      (await GET(new Request('http://localhost/api/admin/queue'))).status,
    ).toBe(401)
    expect(
      (
        await POST(
          new Request('http://localhost/api/admin/queue', {
            method: 'POST',
            body: JSON.stringify({
              kind: 'listing',
              id: 'trc-001',
              status: 'approved',
            }),
          }),
        )
      ).status,
    ).toBe(401)
  })

  it('lists pending items and approves a listing onto the public catalog', async () => {
    const created = await createListing(
      new Request('http://localhost/api/listings', {
        method: 'POST',
        body: JSON.stringify(listingBody),
      }),
    )
    const { id } = (await created.json()) as { id: string }

    const queue = await (
      await adminGet('http://localhost/api/admin/queue')
    ).json()
    expect(queue.listings.map((item: { id: string }) => item.id)).toEqual([id])

    const approved = await adminPost({
      kind: 'listing',
      id,
      status: 'approved',
      note: '掲載可',
    })
    expect(approved.status).toBe(200)
    expect(await approved.json()).toMatchObject({
      id,
      moderationStatus: 'approved',
      moderationNote: '掲載可',
    })
    expect(
      (await (await adminGet('http://localhost/api/admin/queue')).json())
        .listings,
    ).toEqual([])
  })

  it('rejects a pending transport job', async () => {
    const created = await createJob(
      new Request('http://localhost/api/transport/jobs', {
        method: 'POST',
        body: JSON.stringify({
          item: '審査中コンバイン',
          from: '秋田県 大仙市',
          to: '山形県 天童市',
          distanceKm: '120',
          weight: '約2.4t',
          desiredDate: '相談',
          reward: '38000',
          contactEmail: 'owner@example.com',
        }),
      }),
    )
    const { id } = (await created.json()) as { id: string }
    const rejected = await adminPost({
      kind: 'transportJob',
      id,
      status: 'rejected',
      note: '区間が不明瞭',
    })
    expect(rejected.status).toBe(200)
    expect((await rejected.json()).moderationStatus).toBe('rejected')
  })

  it('validates the filter and the decision body', async () => {
    expect(
      (await adminGet('http://localhost/api/admin/queue?status=maybe')).status,
    ).toBe(400)
    expect(
      (await adminPost({ kind: 'listing', id: '', status: 'approved' })).status,
    ).toBe(400)
    expect(
      (
        await adminPost({
          kind: 'listing',
          id: 'missing',
          status: 'approved',
        })
      ).status,
    ).toBe(404)
  })
})
