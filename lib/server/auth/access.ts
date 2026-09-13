import { isApproved, type ModerationStatus } from '@/lib/data'
import type { AuthenticatedUser } from './accounts'

/** Owners manage their own rows; admins manage everything, including unowned rows. */
export function canManage(
  user: AuthenticatedUser | undefined,
  entity: { ownerUserId?: string },
): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return entity.ownerUserId !== undefined && entity.ownerUserId === user.id
}

/** Approved rows are public; unapproved ones are visible to whoever can manage them. */
export function canView(
  user: AuthenticatedUser | undefined,
  entity: { ownerUserId?: string; moderationStatus?: ModerationStatus },
): boolean {
  return isApproved(entity) || canManage(user, entity)
}
