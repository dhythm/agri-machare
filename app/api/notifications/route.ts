import { requireUser } from '@/lib/server/auth/session'
import { countUnread, listNotifications } from '@/lib/server/notifications'

export async function GET() {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const [items, unreadCount] = await Promise.all([
    listNotifications(authorized.user.id),
    countUnread(authorized.user.id),
  ])
  return Response.json({ items, unreadCount })
}
