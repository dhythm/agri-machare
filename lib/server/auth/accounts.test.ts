import { afterEach, describe, expect, it, vi } from 'vitest'
import { authenticate, configuredAccounts, isUserRole } from './accounts'

afterEach(() => {
  vi.unstubAllEnvs()
})

function clearAccountEnv() {
  vi.stubEnv('DEMO_ADMIN_EMAIL', '')
  vi.stubEnv('DEMO_ADMIN_PASSWORD', '')
  vi.stubEnv('DEMO_USER_EMAIL', '')
  vi.stubEnv('DEMO_USER_PASSWORD', '')
}

describe('configuredAccounts', () => {
  it('provides demo accounts outside production when unset', () => {
    clearAccountEnv()
    vi.stubEnv('NODE_ENV', 'test')
    expect(configuredAccounts()).toEqual([
      expect.objectContaining({
        id: 'demo-admin',
        email: 'admin@example.com',
        role: 'admin',
      }),
      expect.objectContaining({
        id: 'demo-user',
        email: 'user@example.com',
        role: 'user',
      }),
    ])
  })

  it('reads accounts from the environment', () => {
    vi.stubEnv('DEMO_ADMIN_EMAIL', 'Ops@Example.com ')
    vi.stubEnv('DEMO_ADMIN_PASSWORD', 'ops-pass')
    vi.stubEnv('DEMO_USER_EMAIL', 'farmer@example.com')
    vi.stubEnv('DEMO_USER_PASSWORD', 'farm-pass')
    expect(configuredAccounts().map((account) => account.email)).toEqual([
      'ops@example.com',
      'farmer@example.com',
    ])
  })

  it('disables unset accounts in production', () => {
    clearAccountEnv()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DEMO_ADMIN_EMAIL', 'ops@example.com')
    vi.stubEnv('DEMO_ADMIN_PASSWORD', 'ops-pass')
    expect(configuredAccounts().map((account) => account.id)).toEqual([
      'demo-admin',
    ])
  })

  it('ignores an account whose password is missing', () => {
    clearAccountEnv()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DEMO_ADMIN_EMAIL', 'ops@example.com')
    expect(configuredAccounts()).toEqual([])
  })
})

describe('authenticate', () => {
  it('returns the user without the password on a match', () => {
    clearAccountEnv()
    vi.stubEnv('NODE_ENV', 'test')
    const user = authenticate(' Admin@Example.com ', 'dev-admin')
    expect(user).toEqual({
      id: 'demo-admin',
      email: 'admin@example.com',
      name: '運営デモ',
      role: 'admin',
    })
  })

  it('rejects a wrong password, unknown email, or empty input', () => {
    clearAccountEnv()
    vi.stubEnv('NODE_ENV', 'test')
    expect(authenticate('admin@example.com', 'dev-user')).toBeUndefined()
    expect(authenticate('nobody@example.com', 'dev-admin')).toBeUndefined()
    expect(authenticate('', '')).toBeUndefined()
  })
})

describe('isUserRole', () => {
  it('accepts only known roles', () => {
    expect(isUserRole('admin')).toBe(true)
    expect(isUserRole('user')).toBe(true)
    expect(isUserRole('owner')).toBe(false)
    expect(isUserRole(undefined)).toBe(false)
  })
})
