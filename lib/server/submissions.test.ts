import { beforeEach, describe, expect, it, vi } from 'vitest'
import { acceptSubmission, listSubmissions } from './submissions'
import { deleteListing } from './listings'
import { resetStore } from './store'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

describe('submissions', () => {
  it('issues a unique receipt and stores the payload', async () => {
    const first = await acceptSubmission('contact', { message: 'a' })
    const second = await acceptSubmission('contact', { message: 'b' })
    expect(first.id).not.toBe(second.id)
    expect(Date.parse(first.receivedAt)).not.toBeNaN()
    const stored = await listSubmissions('contact')
    expect(stored.map((submission) => submission.payload.message)).toEqual([
      'b',
      'a',
    ])
  })

  it('filters by kind and target', async () => {
    await acceptSubmission('listingInquiry', { message: 'x' }, 'trc-001')
    await acceptSubmission('listingInquiry', { message: 'y' }, 'trc-006')
    await acceptSubmission('transportApplication', { message: 'z' }, 'tj-01')
    expect(await listSubmissions('listingInquiry', 'trc-001')).toHaveLength(1)
    expect(await listSubmissions('listingInquiry')).toHaveLength(2)
    expect(await listSubmissions('transportApplication', 'tj-01')).toHaveLength(
      1,
    )
  })

  it('removes inquiries when their listing is deleted', async () => {
    await acceptSubmission('listingInquiry', { message: 'x' }, 'trc-001')
    await acceptSubmission('listingInquiry', { message: 'y' }, 'trc-006')
    await deleteListing('trc-001')
    expect(await listSubmissions('listingInquiry')).toHaveLength(1)
  })
})
