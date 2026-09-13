import { describe, expect, it, vi } from 'vitest'
import { canManage, getCurrentUser, requireAdmin, requireUser } from './session'
import { setAccountStatus } from './account-status'
import { resetStore } from '../store'

const auth = vi.hoisted(() => vi.fn())

vi.mock('@/auth', () => ({ auth }))

describe('getCurrentUser', () => {
  it('treats a suspended account as signed out', async () => {
    await resetStore()
    await setAccountStatus('demo-user', 'suspended')
    auth.mockResolvedValue({
      user: { id: 'demo-user', email: 'user@example.com', role: 'user' },
    })
    expect(await getCurrentUser()).toBeUndefined()
    await setAccountStatus('demo-user', 'active')
    expect((await getCurrentUser())?.id).toBe('demo-user')
  })

  it('returns undefined without a session', async () => {
    auth.mockResolvedValue(null)
    expect(await getCurrentUser()).toBeUndefined()
  })

  it('maps the session user', async () => {
    auth.mockResolvedValue({
      user: {
        id: 'demo-admin',
        email: 'admin@example.com',
        name: '運営デモ',
        role: 'admin',
      },
    })
    expect(await getCurrentUser()).toEqual({
      id: 'demo-admin',
      email: 'admin@example.com',
      name: '運営デモ',
      role: 'admin',
    })
  })
})

describe('requireAdmin', () => {
  it('responds 401 when signed out', async () => {
    auth.mockResolvedValue(null)
    const denied = await requireAdmin()
    expect(denied?.status).toBe(401)
  })

  it('responds 403 for a non-admin user', async () => {
    auth.mockResolvedValue({
      user: { id: 'demo-user', email: 'user@example.com', role: 'user' },
    })
    const denied = await requireAdmin()
    expect(denied?.status).toBe(403)
    expect((await denied?.json()).error).toBe('運営権限がありません。')
  })

  it('allows an admin', async () => {
    auth.mockResolvedValue({
      user: { id: 'demo-admin', email: 'admin@example.com', role: 'admin' },
    })
    expect(await requireAdmin()).toBeUndefined()
  })
})

describe('requireUser', () => {
  it('responds 401 when signed out and returns the user otherwise', async () => {
    auth.mockResolvedValue(null)
    const denied = await requireUser()
    expect(denied.ok).toBe(false)
    if (!denied.ok) expect(denied.response.status).toBe(401)

    auth.mockResolvedValue({
      user: { id: 'demo-user', email: 'user@example.com', role: 'user' },
    })
    const allowed = await requireUser()
    expect(allowed.ok).toBe(true)
    if (allowed.ok) expect(allowed.user.id).toBe('demo-user')
  })
})

describe('canManage', () => {
  const owner = {
    id: 'demo-seller',
    email: 's@example.com',
    name: '',
    role: 'user' as const,
  }
  const other = {
    id: 'demo-user',
    email: 'u@example.com',
    name: '',
    role: 'user' as const,
  }
  const admin = {
    id: 'demo-admin',
    email: 'a@example.com',
    name: '',
    role: 'admin' as const,
  }

  it('allows the owner and admins only', () => {
    expect(canManage(owner, { ownerUserId: 'demo-seller' })).toBe(true)
    expect(canManage(admin, { ownerUserId: 'demo-seller' })).toBe(true)
    expect(canManage(other, { ownerUserId: 'demo-seller' })).toBe(false)
    expect(canManage(undefined, { ownerUserId: 'demo-seller' })).toBe(false)
  })

  it('treats unowned rows as admin-only', () => {
    expect(canManage(owner, {})).toBe(false)
    expect(canManage(admin, {})).toBe(true)
  })
})
