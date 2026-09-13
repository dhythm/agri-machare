import 'server-only'

import { auth } from '@/auth'
import { forbidden, unauthorized } from '@/lib/server/api'
import { isSuspended } from './account-status'
import type { AuthenticatedUser } from './accounts'

export { canManage, canView } from './access'

export async function getCurrentUser(): Promise<AuthenticatedUser | undefined> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email || !user.role) return undefined
  if (await isSuspended(user.id)) return undefined
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    role: user.role,
  }
}

type Authorized =
  { ok: true; user: AuthenticatedUser } | { ok: false; response: Response }

/** Require a signed-in user; the failure carries the 401 response. */
export async function requireUser(): Promise<Authorized> {
  const user = await getCurrentUser()
  return user ? { ok: true, user } : { ok: false, response: unauthorized() }
}

/** Resolve to the error response when the caller is not a signed-in admin. */
export async function requireAdmin(): Promise<Response | undefined> {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden('運営権限がありません。')
  return undefined
}
