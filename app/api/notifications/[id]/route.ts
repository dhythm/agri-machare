import { notFound } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { markRead } from '@/lib/server/notifications'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const notification = await markRead((await params).id, authorized.user.id)
  return notification
    ? Response.json(notification)
    : notFound('通知が見つかりません。')
}
