import { vi } from 'vitest'
import type { AuthenticatedUser } from '@/lib/server/auth/accounts'

/** Stand-in for `@/auth`: `vi.mock('@/auth', () => import('@/test/mock-auth'))`. */
export const auth = vi.fn(
  async () => null as { user: AuthenticatedUser } | null,
)

export const demoAdmin: AuthenticatedUser = {
  id: 'demo-admin',
  email: 'admin@example.com',
  name: '運営デモ',
  role: 'admin',
}

export const demoSeller: AuthenticatedUser = {
  id: 'demo-seller',
  email: 'seller@example.com',
  name: '出品者デモ',
  role: 'user',
}

export const demoUser: AuthenticatedUser = {
  id: 'demo-user',
  email: 'user@example.com',
  name: '利用者デモ',
  role: 'user',
}

export function signInAs(user: AuthenticatedUser | null): void {
  auth.mockResolvedValue(user ? { user } : null)
}
