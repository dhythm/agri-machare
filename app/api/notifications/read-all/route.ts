import { requireUser } from '@/lib/server/auth/session'
import { markAllRead } from '@/lib/server/notifications'

export async function POST() {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  await markAllRead(authorized.user.id)
  return new Response(null, { status: 204 })
}
