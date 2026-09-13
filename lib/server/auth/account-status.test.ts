import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAccountStatus,
  isSuspended,
  setAccountStatus,
} from './account-status'
import { resetStore } from '../store'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

describe('account status', () => {
  it('defaults to active and records suspension with a note', async () => {
    expect(await getAccountStatus('demo-user')).toEqual({ status: 'active' })
    expect(await isSuspended('demo-user')).toBe(false)
    const suspended = await setAccountStatus(
      'demo-user',
      'suspended',
      '規約違反',
    )
    expect(suspended).toMatchObject({ status: 'suspended', note: '規約違反' })
    expect(await isSuspended('demo-user')).toBe(true)
    expect(await getAccountStatus('demo-user')).toMatchObject({
      status: 'suspended',
      note: '規約違反',
    })
    const restored = await setAccountStatus('demo-user', 'active')
    expect(restored.status).toBe('active')
    expect(restored.note).toBeUndefined()
    expect(await isSuspended('demo-user')).toBe(false)
  })
})
