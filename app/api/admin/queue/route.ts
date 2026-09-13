import { badRequest, parseBody } from '@/lib/server/api'
import { requireAdmin } from '@/lib/server/auth/session'
import { applyModeration, getModerationQueue } from '@/lib/server/moderation'
import {
  readModerationQueueFilter,
  validateModerationInput,
} from '@/lib/validation/moderation'

export async function GET(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  const status = readModerationQueueFilter(
    new URL(request.url).searchParams.get('status') ?? undefined,
  )
  if (!status) return badRequest('検索条件が不正です。')
  return Response.json(await getModerationQueue(status))
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  const parsed = await parseBody(request, validateModerationInput)
  if (!parsed.ok) return parsed.response
  const entity = await applyModeration(parsed.value.kind, parsed.value.id, {
    status: parsed.value.status,
    note: parsed.value.note,
  })
  if (!entity)
    return Response.json({ error: '対象が見つかりません。' }, { status: 404 })
  return Response.json(entity)
}
