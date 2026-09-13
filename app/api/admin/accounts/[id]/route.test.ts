import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PATCH } from './route'
import { getAccountStatus } from '@/lib/server/auth/account-status'
import { resetStore } from '@/lib/server/store'
import { demoAdmin, demoUser, signInAs } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))
vi.mock('@/auth', () => import('@/test/mock-auth'))

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test')
  signInAs(demoAdmin)
  return resetStore()
})

const patch = (id: string, body: unknown) =>
  PATCH(
    new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  )

describe('PATCH /api/admin/accounts/[id]', () => {
  it('suspends and restores an account', async () => {
    const suspended = await patch('demo-user', {
      status: 'suspended',
      note: '規約違反',
    })
    expect(suspended.status).toBe(200)
    expect(await suspended.json()).toMatchObject({
      id: 'demo-user',
      status: 'suspended',
      note: '規約違反',
    })
    expect((await getAccountStatus('demo-user')).status).toBe('suspended')
    const restored = await patch('demo-user', { status: 'active' })
    expect((await restored.json()).status).toBe('active')
  })

  it('rejects self-suspension, unknown accounts, bad input, and non-admins', async () => {
    expect((await patch('demo-admin', { status: 'suspended' })).status).toBe(
      409,
    )
    expect((await patch('nobody', { status: 'suspended' })).status).toBe(404)
    expect((await patch('demo-user', { status: 'banned' })).status).toBe(400)
    signInAs(demoUser)
    expect((await patch('demo-seller', { status: 'suspended' })).status).toBe(
      403,
    )
    signInAs(null)
    expect((await patch('demo-seller', { status: 'suspended' })).status).toBe(
      401,
    )
  })
})
