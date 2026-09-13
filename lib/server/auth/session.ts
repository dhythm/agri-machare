import 'server-only'

import { auth } from '@/auth'
import { forbidden, unauthorized } from '@/lib/server/api'
import type { AuthenticatedUser } from './accounts'

export async function getCurrentUser(): Promise<AuthenticatedUser | undefined> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email || !user.role) return undefined
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    role: user.role,
  }
}

/** Resolve to the error response when the caller is not a signed-in admin. */
export async function requireAdmin(): Promise<Response | undefined> {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden('運営権限がありません。')
  return undefined
}
