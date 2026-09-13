import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, GET, PUT } from './route'
import { POST as apply } from './applications/route'
import { listSubmissions } from '@/lib/server/submissions'
import { resetStore } from '@/lib/server/store'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const input = {
  item: 'コンバイン 4条刈（更新）',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: '120',
  weight: '約2.4t',
  desiredDate: '10/1 午前',
  reward: '40000',
  contactEmail: 'owner@example.com',
}

const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/transport/jobs/[id]', () => {
  it('gets a job or 404', async () => {
    expect(
      (await GET(new Request('http://localhost'), context('tj-01'))).status,
    ).toBe(200)
    expect(
      (await GET(new Request('http://localhost'), context('missing'))).status,
    ).toBe(404)
  })

  it('updates a job', async () => {
    const response = await PUT(
      new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
      context('tj-01'),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ id: 'tj-01', reward: 40_000 })
    expect(
      (
        await PUT(
          new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify(input),
          }),
          context('missing'),
        )
      ).status,
    ).toBe(404)
  })

  it('deletes a job with its applications', async () => {
    await apply(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: '高橋',
          email: 'k@example.com',
          vehicle: '2tトラック',
          availableDate: '2026-10-03',
        }),
      }),
      context('tj-01'),
    )
    expect(await listSubmissions('transportApplication', 'tj-01')).toHaveLength(
      1,
    )
    expect(
      (await DELETE(new Request('http://localhost'), context('tj-01'))).status,
    ).toBe(204)
    expect(await listSubmissions('transportApplication', 'tj-01')).toHaveLength(
      0,
    )
    expect(
      (await DELETE(new Request('http://localhost'), context('tj-01'))).status,
    ).toBe(404)
  })
})
