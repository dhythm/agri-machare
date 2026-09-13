import { describe, expect, it, vi } from 'vitest'
import {
  getTransportJob,
  getTransportJobIds,
  getTransportJobs,
} from './transport'

vi.mock('server-only', () => ({}))

describe('transport jobs', () => {
  it('lists jobs with unique ids', () => {
    const ids = getTransportJobIds()
    expect(ids.length).toBeGreaterThanOrEqual(8)
    expect(new Set(ids).size).toBe(ids.length)
    expect(getTransportJobs().map((job) => job.id)).toEqual(ids)
  })

  it('finds a job and handles an unknown id', () => {
    expect(getTransportJob('tj-01')?.item).toContain('コンバイン')
    expect(getTransportJob('missing')).toBeUndefined()
  })
})
