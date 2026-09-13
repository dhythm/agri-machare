import { orderFailure, parseBody } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { updateOrderStatus } from '@/lib/server/orders'
import { validateOrderStatus } from '@/lib/validation/order'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateOrderStatus)
  if (!parsed.ok) return parsed.response
  const result = await updateOrderStatus(
    (await params).id,
    authorized.user,
    parsed.value.status,
  )
  return result.ok ? Response.json(result.value) : orderFailure(result.reason)
}
