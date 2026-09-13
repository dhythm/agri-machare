import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTransportJob,
  deleteTransportJob,
  getTransportJob,
  getTransportJobIds,
  getTransportJobs,
  updateTransportJob,
} from './transport'
import { resetStore } from './store'
import type { TransportJobInput } from '@/lib/validation/transport'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const input: TransportJobInput = {
  item: 'トラクター 25馬力',
  from: '長野県 松本市',
  to: '長野県 諏訪市',
  distanceKm: 40,
  weight: '約1.2t',
  desiredDate: '相談',
  reward: 14_000,
  contactEmail: 'owner@example.com',
}

describe('transport jobs', () => {
  it('lists jobs with unique ids', async () => {
    const ids = await getTransportJobIds()
    expect(ids.length).toBeGreaterThanOrEqual(10)
    expect(new Set(ids).size).toBe(ids.length)
    expect((await getTransportJobs()).map((job) => job.id)).toEqual(ids)
  })

  it('finds a job and handles an unknown id', async () => {
    expect((await getTransportJob('tj-01'))?.item).toContain('コンバイン')
    expect(await getTransportJob('missing')).toBeUndefined()
  })

  it('creates an open job listed first, without the contact email', async () => {
    const created = await createTransportJob(input)
    expect(created).toMatchObject({
      item: input.item,
      status: '募集中',
      reward: 14_000,
    })
    expect(JSON.stringify(created)).not.toContain('owner@example.com')
    expect((await getTransportJobs())[0].id).toBe(created.id)
  })

  it('updates and deletes a job', async () => {
    const created = await createTransportJob(input)
    const updated = await updateTransportJob(created.id, {
      ...input,
      reward: 20_000,
    })
    expect(updated).toMatchObject({
      id: created.id,
      reward: 20_000,
      status: '募集中',
    })
    expect(await updateTransportJob('missing', input)).toBeUndefined()
    expect(await deleteTransportJob(created.id)).toBe(true)
    expect(await getTransportJob(created.id)).toBeUndefined()
    expect(await deleteTransportJob(created.id)).toBe(false)
  })
})
