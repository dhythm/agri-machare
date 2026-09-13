import { parseBody, rentalFailure } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { updateRentalStatus } from '@/lib/server/rentals'
import { validateRentalStatus } from '@/lib/validation/rental'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateRentalStatus)
  if (!parsed.ok) return parsed.response
  const result = await updateRentalStatus(
    (await params).id,
    authorized.user,
    parsed.value.status,
  )
  return result.ok ? Response.json(result.value) : rentalFailure(result.reason)
}
