import { parseBody } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { getCarrierProfile, upsertCarrierProfile } from '@/lib/server/carriers'
import { validateCarrierProfile } from '@/lib/validation/carrier'

export async function GET() {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const profile = await getCarrierProfile(authorized.user.id)
  return Response.json({ profile: profile ?? null })
}

export async function PUT(request: Request) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateCarrierProfile)
  if (!parsed.ok) return parsed.response
  return Response.json(
    await upsertCarrierProfile(authorized.user, parsed.value),
  )
}
