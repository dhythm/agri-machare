import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  adminCookieHeader,
  adminCookieName,
  adminSecretHeader,
  configuredAdminSecret,
  isAdminRequest,
  isValidAdminSecret,
} from './admin'

vi.mock('server-only', () => ({}))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('admin secret', () => {
  it('defaults to the development key outside production', () => {
    vi.stubEnv('ADMIN_SECRET', '')
    vi.stubEnv('NODE_ENV', 'test')
    expect(configuredAdminSecret()).toBe('dev-admin')
    expect(isValidAdminSecret('dev-admin')).toBe(true)
    expect(isValidAdminSecret('wrong')).toBe(false)
  })

  it('denies access in production when no secret is configured', () => {
    vi.stubEnv('ADMIN_SECRET', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(configuredAdminSecret()).toBeUndefined()
    expect(isValidAdminSecret('dev-admin')).toBe(false)
  })

  it('accepts the header or the cookie', () => {
    vi.stubEnv('ADMIN_SECRET', 'shared-key')
    expect(
      isAdminRequest(
        new Request('http://localhost', {
          headers: { [adminSecretHeader]: 'shared-key' },
        }),
      ),
    ).toBe(true)
    expect(
      isAdminRequest(
        new Request('http://localhost', {
          headers: { cookie: `${adminCookieName}=shared-key` },
        }),
      ),
    ).toBe(true)
    expect(isAdminRequest(new Request('http://localhost'))).toBe(false)
    expect(adminCookieHeader('shared-key')).toContain(`${adminCookieName}=`)
    expect(adminCookieHeader('shared-key')).toContain('HttpOnly')
  })
})
