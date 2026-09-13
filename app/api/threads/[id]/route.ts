import { parseBody, threadFailure } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { getThread, updateThreadStatus } from '@/lib/server/threads'
import { validateThreadStatus } from '@/lib/validation/thread'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const result = await getThread((await params).id, authorized.user)
  return result.ok ? Response.json(result.value) : threadFailure(result.reason)
}

export async function PATCH(request: Request, { params }: Context) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateThreadStatus)
  if (!parsed.ok) return parsed.response
  const result = await updateThreadStatus(
    (await params).id,
    authorized.user,
    parsed.value.status,
  )
  return result.ok ? Response.json(result.value) : threadFailure(result.reason)
}
