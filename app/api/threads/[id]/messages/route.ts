import { parseBody, threadFailure } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { addMessage } from '@/lib/server/threads'
import { validateMessage } from '@/lib/validation/thread'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateMessage)
  if (!parsed.ok) return parsed.response
  const result = await addMessage(
    (await params).id,
    authorized.user,
    parsed.value.body,
  )
  return result.ok
    ? Response.json(result.value, { status: 201 })
    : threadFailure(result.reason)
}
