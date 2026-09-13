import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStore, resetStore } from './index'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

describe('store', () => {
  it('is seeded with the sample data', async () => {
    const store = getStore()
    expect((await store.listings.list()).length).toBeGreaterThanOrEqual(48)
    expect((await store.transportJobs.list()).length).toBeGreaterThanOrEqual(10)
    expect(await store.submissions.list()).toEqual([])
  })

  it('returns the same instance until reset', async () => {
    const store = getStore()
    await store.listings.delete('trc-001')
    expect(await getStore().listings.get('trc-001')).toBeUndefined()
    resetStore()
    expect(await getStore().listings.get('trc-001')).toBeDefined()
  })
})
