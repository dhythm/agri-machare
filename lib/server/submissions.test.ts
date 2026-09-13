import { describe, expect, it, vi } from 'vitest'
import { acceptSubmission } from './submissions'

vi.mock('server-only', () => ({}))

describe('acceptSubmission', () => {
  it('issues a unique receipt with a timestamp', () => {
    const first = acceptSubmission('contact', { message: 'a' })
    const second = acceptSubmission('contact', { message: 'b' })
    expect(first.id).not.toBe(second.id)
    expect(Date.parse(first.receivedAt)).not.toBeNaN()
  })
})
