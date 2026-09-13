import { describe, expect, it, vi } from 'vitest'
import { getCurrentUser, requireAdmin } from './session'

const auth = vi.hoisted(() => vi.fn())

vi.mock('@/auth', () => ({ auth }))

describe('getCurrentUser', () => {
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
